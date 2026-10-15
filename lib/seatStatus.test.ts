import { describe, expect, it } from "vitest";
import { CHECKIN_DURATION_MS, checkIn, checkOut, getTableStatuses } from "./seatStatus";
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

describe("C2 checkIn", () => {
  const token = () => "new-token";

  it("S2-AC1: checking in at a free table makes it occupied", () => {
    const store = createMemoryStore();

    const result = checkIn(layout, store, "T1", NOW, token);

    expect(result).toEqual({
      ok: true,
      table: { id: "T1", row: 0, col: 0, status: "occupied" },
      checkinToken: "new-token",
      expiresAt: new Date(NOW.getTime() + CHECKIN_DURATION_MS),
    });
    expect(getTableStatuses(layout, store, NOW).tables[0].status).toBe("occupied");
  });

  it("R1: checking in at an occupied table is rejected and keeps the first check-in", () => {
    const store = createMemoryStore();
    store.set("T1", { token: "first", checkedInAt: minutesAgo(5) });

    const result = checkIn(layout, store, "T1", NOW, token);

    expect(result).toEqual({ ok: false, code: "TABLE_OCCUPIED" });
    expect(store.get("T1")?.token).toBe("first");
  });

  it("R2: checking in at a table whose check-in expired is accepted", () => {
    const store = createMemoryStore();
    store.set("T1", { token: "old", checkedInAt: minutesAgo(61) });

    const result = checkIn(layout, store, "T1", NOW, token);

    expect(result.ok).toBe(true);
    expect(store.get("T1")?.token).toBe("new-token");
  });

  it("rejects an unknown table", () => {
    expect(checkIn(layout, createMemoryStore(), "T99", NOW, token)).toEqual({
      ok: false,
      code: "TABLE_NOT_FOUND",
    });
  });
});

describe("C2 checkOut", () => {
  it("S2-AC2: checking out with the check-in token makes the table free", () => {
    const store = createMemoryStore();
    store.set("T1", { token: "mine", checkedInAt: minutesAgo(5) });

    const result = checkOut(layout, store, "T1", "mine", NOW);

    expect(result).toEqual({ ok: true, table: { id: "T1", row: 0, col: 0, status: "free" } });
    expect(getTableStatuses(layout, store, NOW).tables[0].status).toBe("free");
  });

  it("security: a wrong token cannot free someone else's table", () => {
    const store = createMemoryStore();
    store.set("T1", { token: "mine", checkedInAt: minutesAgo(5) });

    const result = checkOut(layout, store, "T1", "not-mine", NOW);

    expect(result).toEqual({ ok: false, code: "INVALID_TOKEN" });
    expect(getTableStatuses(layout, store, NOW).tables[0].status).toBe("occupied");
  });

  it("rejects a check-out at a free table", () => {
    expect(checkOut(layout, createMemoryStore(), "T1", "any", NOW)).toEqual({
      ok: false,
      code: "TABLE_NOT_OCCUPIED",
    });
  });

  it("R2: rejects a check-out after the check-in expired, even with the right token", () => {
    const store = createMemoryStore();
    store.set("T1", { token: "mine", checkedInAt: minutesAgo(60) });

    expect(checkOut(layout, store, "T1", "mine", NOW)).toEqual({
      ok: false,
      code: "TABLE_NOT_OCCUPIED",
    });
  });

  it("rejects an unknown table", () => {
    expect(checkOut(layout, createMemoryStore(), "T99", "any", NOW)).toEqual({
      ok: false,
      code: "TABLE_NOT_FOUND",
    });
  });
});
