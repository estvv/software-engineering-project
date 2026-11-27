// C2 Seat Status Service: decides each table's status (decision D1).
// C1 never applies these rules itself; it only displays the result.

import type { CheckIn, StatusStore } from "./statusStore";
import type { LayoutTable, Table, TableStatus, TablesResponse } from "./types";

/** Rule R2: a check-in is valid for 60 minutes. */
export const CHECKIN_DURATION_MS = 60 * 60 * 1000;

/** Check-ins made strictly after this moment are still active (rule R2). */
function activeSince(now: Date): Date {
  return new Date(now.getTime() - CHECKIN_DURATION_MS);
}

function statusOf(checkIn: CheckIn | undefined, now: Date): TableStatus {
  return checkIn && checkIn.checkedInAt.getTime() > activeSince(now).getTime() ? "occupied" : "free";
}

/** Statuses of every table, plus the "no free table" indication (S1-AC1, S1-AC2). */
export async function getTableStatuses(
  layout: LayoutTable[],
  store: StatusStore,
  now: Date,
): Promise<TablesResponse> {
  const checkIns = await store.getAll();
  const tables: Table[] = layout
    .map((t) => ({ ...t, status: statusOf(checkIns.get(t.id), now) }))
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
export async function checkIn(
  layout: LayoutTable[],
  store: StatusStore,
  tableId: string,
  now: Date,
  newToken: () => string,
): Promise<CheckInResult> {
  const table = findTable(layout, tableId);
  if (!table) return { ok: false, code: "TABLE_NOT_FOUND" };

  // The store replaces an expired check-in (R2) and refuses an active one (R1),
  // in one atomic step.
  const checkinToken = newToken();
  const claimed = await store.claim(tableId, { token: checkinToken, checkedInAt: now }, activeSince(now));
  if (!claimed) return { ok: false, code: "TABLE_OCCUPIED" };
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
export async function checkOut(
  layout: LayoutTable[],
  store: StatusStore,
  tableId: string,
  token: string,
  now: Date,
): Promise<CheckOutResult> {
  const table = findTable(layout, tableId);
  if (!table) return { ok: false, code: "TABLE_NOT_FOUND" };
  if (await store.release(tableId, token, activeSince(now))) {
    return { ok: true, table: { ...table, status: "free" } };
  }

  // Not released: find out why, to return the error of the contract.
  const current = await store.get(tableId);
  if (statusOf(current, now) === "occupied") return { ok: false, code: "INVALID_TOKEN" };
  if (current) await store.delete(tableId); // drop an expired check-in
  return { ok: false, code: "TABLE_NOT_OCCUPIED" };
}
