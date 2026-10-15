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
