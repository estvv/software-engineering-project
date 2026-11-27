"use client";

// C1 Map UI. It only displays what C2 returns through the API (decision D1):
// statuses, "no free table" and error messages all come from the response.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CheckInResponse, ErrorBody, TablesResponse } from "@/lib/types";
import styles from "./page.module.css";

const GENERIC_ERROR = "Something went wrong, please retry.";
const MINE_KEY = "seattogether.myCheckin";
const LEGACY_TOKENS_KEY = "seattogether.checkinTokens";
// Other students' check-ins must appear within 10 s (report section 7), so we poll at half that.
const REFRESH_MS = 5000;

type Notice = { kind: "ok" | "error"; text: string };

/**
 * The student's own check-in, kept in this browser only (no account, see
 * API_contract.md section 5). One check-in at a time (issue #32).
 */
interface MyCheckIn {
  tableId: string;
  token: string;
  expiresAt: string | null; // null for a check-in saved by an older version
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store", ...init });
  } catch {
    throw new Error(GENERIC_ERROR);
  }
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new Error((body as ErrorBody | null)?.error?.message ?? GENERIC_ERROR);
  return body as T;
}

// My check-in lives in localStorage; React reads it as an external store, so a
// reload, or a change in another tab, shows the same table (#34).
const mineListeners = new Set<() => void>();

function subscribeMine(onChange: () => void) {
  mineListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    mineListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Raw saved value (a string, so React can compare snapshots), or null. */
function mineSnapshot(): string | null {
  try {
    const saved = localStorage.getItem(MINE_KEY);
    if (saved) return saved;
    // Older versions kept { tableId: token } under another key.
    const legacy = JSON.parse(localStorage.getItem(LEGACY_TOKENS_KEY) ?? "{}") as Record<string, string>;
    const [tableId, token] = Object.entries(legacy)[0] ?? [];
    return tableId && token ? JSON.stringify({ tableId, token, expiresAt: null }) : null;
  } catch {
    return null;
  }
}

function parseMine(raw: string | null): MyCheckIn | null {
  try {
    const mine = JSON.parse(raw ?? "null") as MyCheckIn | null;
    return mine?.tableId && mine.token ? mine : null;
  } catch {
    return null;
  }
}

function saveMine(mine: MyCheckIn | null) {
  try {
    localStorage.removeItem(LEGACY_TOKENS_KEY);
    if (mine) localStorage.setItem(MINE_KEY, JSON.stringify(mine));
    else localStorage.removeItem(MINE_KEY);
  } catch {
    // Storage blocked (private mode): the check-in works, it is only not remembered.
  }
  mineListeners.forEach((notify) => notify());
}

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/** True when my saved check-in no longer holds a table: expired (R2) or freed. */
function isOver(mine: MyCheckIn, tables: TablesResponse): boolean {
  if (mine.expiresAt !== null && new Date(mine.expiresAt).getTime() <= Date.now()) return true;
  const table = tables.tables.find((t) => t.id === mine.tableId);
  return !table || table.status === "free";
}

export default function Home() {
  const [data, setData] = useState<TablesResponse | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);
  const [stale, setStale] = useState(false);
  const mine = parseMine(useSyncExternalStore(subscribeMine, mineSnapshot, () => null));
  // Until the student picks a table, their own table is selected.
  const selectedId = pickedId ?? mine?.tableId ?? null;
  const lastLoad = useRef(0);

  // Only the most recent request may update the map: a slow poll must not
  // overwrite the result of a check-in that finished after it started.
  const loadTables = useCallback(async () => {
    const load = ++lastLoad.current;
    const tables = await request<TablesResponse>("/api/tables");
    if (load === lastLoad.current) {
      setData(tables);
      setStale(false);
      const saved = parseMine(mineSnapshot());
      if (saved && isOver(saved, tables)) saveMine(null);
    }
  }, []);

  useEffect(() => {
    loadTables().catch((e: Error) => setNotice({ kind: "error", text: e.message }));
    const timer = setInterval(() => {
      if (document.hidden) return;
      // Keep the last map on failure, but say that it may be out of date.
      loadTables().catch(() => setStale(true));
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [loadTables]);

  async function checkIn(tableId: string): Promise<string> {
    const res = await request<CheckInResponse>(`/api/tables/${tableId}/checkin`, { method: "POST" });
    saveMine({ tableId, token: res.checkinToken, expiresAt: res.expiresAt });
    return `You are checked in at ${tableId} until ${timeOf(res.expiresAt)}.`;
  }

  async function checkOut(tableId: string): Promise<string> {
    // Without my token we still ask C2, so that it decides which error applies (403 or 409).
    const isMine = mine?.tableId === tableId;
    await request(`/api/tables/${tableId}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkinToken: isMine ? mine.token : "" }),
    });
    if (isMine) saveMine(null);
    return `Table ${tableId} is free again. Thank you!`;
  }

  async function run(action: (tableId: string) => Promise<string>, tableId: string | null) {
    if (!tableId) return;
    setBusy(true);
    setNotice(null);
    try {
      setNotice({ kind: "ok", text: await action(tableId) });
    } catch (e) {
      setNotice({ kind: "error", text: (e as Error).message });
    }
    try {
      await loadTables();
    } catch (e) {
      setNotice({ kind: "error", text: (e as Error).message });
    }
    setBusy(false);
  }

  const cols = data ? Math.max(...data.tables.map((t) => t.col)) + 1 : 1;
  const alreadyCheckedIn = mine !== null && mine.tableId !== selectedId;

  return (
    <main className={styles.main}>
      <h1>SeatTogether</h1>
      <p className={styles.subtitle}>Inha student cafeteria (temporary layout)</p>

      {mine && (
        <section className={styles.mine} aria-label="My table">
          <p>
            Your table: <strong>{mine.tableId}</strong>
            {mine.expiresAt && <> until {timeOf(mine.expiresAt)}</>}
          </p>
          <button type="button" disabled={busy} onClick={() => run(checkOut, mine.tableId)}>
            I&apos;m leaving {mine.tableId}
          </button>
        </section>
      )}

      {data?.noFreeTable && (
        <p className={styles.noFree} role="status">
          No free table reported right now
        </p>
      )}

      {stale && (
        <p className={styles.error} role="status">
          Connection lost: the map may be out of date.
        </p>
      )}

      {data === null ? (
        <p>Loading tables…</p>
      ) : (
        <div className={styles.map} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {data.tables.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.table} ${styles[t.status]} ${t.id === selectedId ? styles.selected : ""}`}
              style={{ gridRow: t.row + 1, gridColumn: t.col + 1 }}
              aria-pressed={t.id === selectedId}
              onClick={() => setPickedId(t.id)}
            >
              <span className={styles.tableId}>{t.id}</span>
              <span>{t.status}</span>
              {t.id === mine?.tableId && <span className={styles.yours}>yours</span>}
            </button>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <p>{selectedId ? `Selected table: ${selectedId}` : "Select a table on the map."}</p>
        <button
          type="button"
          disabled={!selectedId || busy || mine !== null}
          aria-describedby={alreadyCheckedIn ? "one-table-hint" : undefined}
          onClick={() => run(checkIn, selectedId)}
        >
          I&apos;m sitting here
        </button>
        <button type="button" disabled={!selectedId || busy} onClick={() => run(checkOut, selectedId)}>
          I&apos;m leaving
        </button>
        {alreadyCheckedIn && (
          <p id="one-table-hint" className={styles.hint}>
            You are already checked in at {mine.tableId}. Leave it first to change table.
          </p>
        )}
      </div>

      {notice && (
        <p className={notice.kind === "error" ? styles.error : styles.ok} role="alert">
          {notice.text}
        </p>
      )}
    </main>
  );
}
