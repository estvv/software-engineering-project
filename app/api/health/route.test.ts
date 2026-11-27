import { afterEach, describe, expect, it, vi } from "vitest";
import { getStatusStore } from "@/lib/statusStore";
import { GET } from "./route";

describe("GET /api/health", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns 200 and the store kind when the store answers", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok", store: "memory" });
  });

  it("returns 503 when the store cannot be reached, and logs it", async () => {
    vi.spyOn(getStatusStore(), "ping").mockRejectedValueOnce(new Error("connection refused"));
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await GET();

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ status: "unavailable", store: "memory" });
    expect(JSON.parse(errors.mock.calls[0][0] as string)).toMatchObject({
      level: "error",
      event: "health.store_unreachable",
      error: "connection refused",
    });
  });
});
