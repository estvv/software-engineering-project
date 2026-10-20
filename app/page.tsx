"use client";

// C1 Map UI. It only displays what C2 returns through the API (decision D1):
// statuses, "no free table" and error messages all come from the response.

import { useEffect, useState } from "react";
import type { CheckInResponse, ErrorBody, TablesResponse } from "@/lib/types";
import styles from "./page.module.css";

const GENERIC_ERROR = "Something went wrong, please retry.";
const TOKENS_KEY = "seattogether.checkinTokens";

type Notice = { kind: "ok" | "error"; text: string };

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

function readTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(TOKENS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveToken(tableId: string, token: string | null) {
  const tokens = readTokens();
  if (token) tokens[tableId] = token;
  else delete tokens[tableId];
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

async function checkIn(tableId: string): Promise<string> {
  const res = await request<CheckInResponse>(`/api/tables/${tableId}/checkin`, { method: "POST" });
  saveToken(tableId, res.checkinToken);
  const until = new Date(res.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `You are checked in at ${tableId} until ${until}.`;
}

async function checkOut(tableId: string): Promise<string> {
  // Without a stored token we still ask C2, so that it decides which error applies (403 or 409).
  await request(`/api/tables/${tableId}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ checkinToken: readTokens()[tableId] ?? "" }),
  });
  saveToken(tableId, null);
  return `Table ${tableId} is free again. Thank you!`;
}

export default function Home() {
  const [data, setData] = useState<TablesResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    request<TablesResponse>("/api/tables").then(setData, (e: Error) =>
      setNotice({ kind: "error", text: e.message }),
    );
  }, []);

  async function run(action: (tableId: string) => Promise<string>) {
    if (!selectedId) return;
    setBusy(true);
    setNotice(null);
    try {
      setNotice({ kind: "ok", text: await action(selectedId) });
    } catch (e) {
      setNotice({ kind: "error", text: (e as Error).message });
    }
    try {
      setData(await request<TablesResponse>("/api/tables"));
    } catch (e) {
      setNotice({ kind: "error", text: (e as Error).message });
    }
    setBusy(false);
  }

  const cols = data ? Math.max(...data.tables.map((t) => t.col)) + 1 : 1;

  return (
    <main className={styles.main}>
      <h1>SeatTogether</h1>
      <p className={styles.subtitle}>Inha student cafeteria (temporary layout)</p>

      {data?.noFreeTable && (
        <p className={styles.noFree} role="status">
          No free table reported right now
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
              onClick={() => setSelectedId(t.id)}
            >
              <span className={styles.tableId}>{t.id}</span>
              <span>{t.status}</span>
            </button>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <p>{selectedId ? `Selected table: ${selectedId}` : "Select a table on the map."}</p>
        <button type="button" disabled={!selectedId || busy} onClick={() => run(checkIn)}>
          I&apos;m sitting here
        </button>
        <button type="button" disabled={!selectedId || busy} onClick={() => run(checkOut)}>
          I&apos;m leaving
        </button>
      </div>

      {notice && (
        <p className={notice.kind === "error" ? styles.error : styles.ok} role="alert">
          {notice.text}
        </p>
      )}
    </main>
  );
}
