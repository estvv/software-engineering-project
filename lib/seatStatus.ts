// C2 Seat Status Service: decides each table's status (decision D1).
// C1 never applies these rules itself; it only displays the result.

import type { StatusStore } from "./statusStore";
import type { LayoutTable, Table, TableStatus, TablesResponse } from "./types";

/** Rule R2: a check-in is valid for 60 minutes. */
export const CHECKIN_DURATION_MS = 60 * 60 * 1000;

function statusOf(tableId: string, store: StatusStore, now: Date): TableStatus {
  const checkIn = store.get(tableId);
  if (!checkIn) return "free";
  const age = now.getTime() - checkIn.checkedInAt.getTime();
  return age < CHECKIN_DURATION_MS ? "occupied" : "free";
}

/** Statuses of every table, plus the "no free table" indication (S1-AC1, S1-AC2). */
export function getTableStatuses(
  layout: LayoutTable[],
  store: StatusStore,
  now: Date,
): TablesResponse {
  const tables: Table[] = layout
    .map((t) => ({ ...t, status: statusOf(t.id, store, now) }))
    .sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
  return {
    tables,
    noFreeTable: !tables.some((t) => t.status === "free"),
  };
}

function findTable(layout: LayoutTable[], tableId: string): LayoutTable | undefined {
  return layout.find((t) => t.id === tableId);
}

/** True if the table ID exists in the layout. */
export function tableExists(layout: LayoutTable[], tableId: string): boolean {
  return findTable(layout, tableId) !== undefined;
}

export type CheckInResult =
  | { ok: true; table: Table; checkinToken: string; expiresAt: Date }
  | { ok: false; code: "TABLE_NOT_FOUND" | "TABLE_OCCUPIED" };

/** "I'm sitting here" (S2-AC1). Rejects a table that is already occupied (rule R1). */
export function checkIn(
  layout: LayoutTable[],
  store: StatusStore,
  tableId: string,
  now: Date,
  newToken: () => string,
): CheckInResult {
  const table = findTable(layout, tableId);
  if (!table) return { ok: false, code: "TABLE_NOT_FOUND" };
  if (statusOf(tableId, store, now) === "occupied") return { ok: false, code: "TABLE_OCCUPIED" };

  // An expired check-in (R2) is simply replaced.
  const checkinToken = newToken();
  store.set(tableId, { token: checkinToken, checkedInAt: now });
  return {
    ok: true,
    table: { ...table, status: "occupied" },
    checkinToken,
    expiresAt: new Date(now.getTime() + CHECKIN_DURATION_MS),
  };
}

export type CheckOutResult =
  | { ok: true; table: Table }
  | { ok: false; code: "TABLE_NOT_FOUND" | "TABLE_NOT_OCCUPIED" | "INVALID_TOKEN" };

/**
 * "I'm leaving" (S2-AC2). Only the token returned by the check-in can free the
 * table, so one student cannot free another student's table.
 */
export function checkOut(
  layout: LayoutTable[],
  store: StatusStore,
  tableId: string,
  token: string,
  now: Date,
): CheckOutResult {
  const table = findTable(layout, tableId);
  if (!table) return { ok: false, code: "TABLE_NOT_FOUND" };
  if (statusOf(tableId, store, now) === "free") {
    store.delete(tableId); // drop an expired check-in, if any
    return { ok: false, code: "TABLE_NOT_OCCUPIED" };
  }
  if (store.get(tableId)?.token !== token) return { ok: false, code: "INVALID_TOKEN" };

  store.delete(tableId);
  return { ok: true, table: { ...table, status: "free" } };
}
