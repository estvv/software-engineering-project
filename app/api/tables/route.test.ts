import { beforeEach, describe, expect, it } from "vitest";
import { getLayout } from "@/lib/layout";
import { statusStore } from "@/lib/statusStore";
import type { TablesResponse } from "@/lib/types";
import { GET } from "./route";

describe("GET /api/tables", () => {
  beforeEach(() => {
    for (const t of getLayout()) statusStore.delete(t.id);
  });

  it("returns 200, no-store, and every layout table as free on an empty store", async () => {
    const res = GET();
    const body = (await res.json()) as TablesResponse;

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(body.tables).toHaveLength(getLayout().length);
    expect(body.tables.every((t) => t.status === "free")).toBe(true);
    expect(body.noFreeTable).toBe(false);
  });

  it("shows a checked-in table as occupied", async () => {
    statusStore.set("T1", { token: "t1", checkedInAt: new Date() });

    const body = (await GET().json()) as TablesResponse;

    expect(body.tables.find((t) => t.id === "T1")?.status).toBe("occupied");
  });

  it("returns noFreeTable when every table is checked in", async () => {
    for (const t of getLayout()) statusStore.set(t.id, { token: t.id, checkedInAt: new Date() });

    const body = (await GET().json()) as TablesResponse;

    expect(body.noFreeTable).toBe(true);
  });
});
