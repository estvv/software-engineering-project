import { describe, expect, it } from "vitest";
import { CHECKIN_DURATION_MS, getTableStatuses } from "./seatStatus";
import { createMemoryStore } from "./statusStore";
import type { LayoutTable } from "./types";

const NOW = new Date("2026-10-20T12:15:00Z");
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60 * 1000);

const layout: LayoutTable[] = [
  { id: "T1", row: 0, col: 0 },
  { id: "T2", row: 0, col: 1 },
];

describe("C2 getTableStatuses", () => {
  it("S1-AC1: T1 free and T2 occupied are returned with their status", () => {
    const store = createMemoryStore();
    store.set("T2", { token: "t2", checkedInAt: minutesAgo(5) });

    const result = getTableStatuses(layout, store, NOW);

    expect(result.tables).toEqual([
      { id: "T1", row: 0, col: 0, status: "free" },
      { id: "T2", row: 0, col: 1, status: "occupied" },
    ]);
    expect(result.noFreeTable).toBe(false);
  });

  it("S1-AC2: every table occupied gives noFreeTable and still returns the tables", () => {
    const store = createMemoryStore();
    store.set("T1", { token: "t1", checkedInAt: minutesAgo(10) });
    store.set("T2", { token: "t2", checkedInAt: minutesAgo(20) });

    const result = getTableStatuses(layout, store, NOW);

    expect(result.noFreeTable).toBe(true);
    expect(result.tables.map((t) => t.status)).toEqual(["occupied", "occupied"]);
  });

  it("R2: a check-in is occupied before 60 minutes and free from 60 minutes", () => {
    const store = createMemoryStore();
    store.set("T1", { token: "t1", checkedInAt: new Date(NOW.getTime() - CHECKIN_DURATION_MS + 1) });
    store.set("T2", { token: "t2", checkedInAt: new Date(NOW.getTime() - CHECKIN_DURATION_MS) });

    const result = getTableStatuses(layout, store, NOW);

    expect(result.tables.map((t) => t.status)).toEqual(["occupied", "free"]);
  });

  it("sorts tables by ID in numeric order (T2 before T10)", () => {
    const result = getTableStatuses(
      [{ id: "T10", row: 1, col: 0 }, { id: "T2", row: 0, col: 0 }],
      createMemoryStore(),
      NOW,
    );
    expect(result.tables.map((t) => t.id)).toEqual(["T2", "T10"]);
  });
});
