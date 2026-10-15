import { beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/tables/route";
import { getLayout } from "@/lib/layout";
import { statusStore } from "@/lib/statusStore";
import type { CheckInResponse, ErrorBody, TablesResponse } from "@/lib/types";
import { POST as checkinPOST } from "./checkin/route";
import { POST as checkoutPOST } from "./checkout/route";

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const post = (body?: string) =>
  new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
const checkin = (id: string) => checkinPOST(post(), ctx(id));
const checkout = (id: string, body?: string) => checkoutPOST(post(body), ctx(id));
const tokenBody = (checkinToken: unknown) => JSON.stringify({ checkinToken });

async function statusOf(id: string) {
  const body = (await GET().json()) as TablesResponse;
  return body.tables.find((t) => t.id === id)?.status;
}

async function errorCode(res: Response) {
  return ((await res.json()) as ErrorBody).error.code;
}

describe("POST /api/tables/{id}/checkin and /checkout", () => {
  beforeEach(() => {
    for (const t of getLayout()) statusStore.delete(t.id);
  });

  it("S2-AC1: check-in returns 201 with a token, and the map shows the table occupied", async () => {
    const res = await checkin("T1");
    const body = (await res.json()) as CheckInResponse;

    expect(res.status).toBe(201);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(body.table).toEqual({ id: "T1", row: 0, col: 0, status: "occupied" });
    expect(body.checkinToken).toMatch(/^[0-9a-f-]{36}$/);
    expect(new Date(body.expiresAt).getTime()).toBeGreaterThan(Date.now());
    expect(await statusOf("T1")).toBe("occupied");
  });

  it("S2-AC2: check-out with the token returns 200, and the map shows the table free", async () => {
    const { checkinToken } = (await (await checkin("T1")).json()) as CheckInResponse;

    const res = await checkout("T1", tokenBody(checkinToken));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ table: { id: "T1", row: 0, col: 0, status: "free" } });
    expect(await statusOf("T1")).toBe("free");
  });

  it("R1: a second check-in at the same table returns 409 TABLE_OCCUPIED", async () => {
    await checkin("T1");

    const res = await checkin("T1");

    expect(res.status).toBe(409);
    expect(await errorCode(res)).toBe("TABLE_OCCUPIED");
  });

  it("security: check-out with another token returns 403 and the table stays occupied", async () => {
    await checkin("T1");

    const res = await checkout("T1", tokenBody("6f1c2b9e-4a7d-4c1e-9b0a-2d5e8f3a7c10"));

    expect(res.status).toBe(403);
    expect(await errorCode(res)).toBe("INVALID_TOKEN");
    expect(await statusOf("T1")).toBe("occupied");
  });

  it("two check-ins give two different tokens", async () => {
    const a = (await (await checkin("T1")).json()) as CheckInResponse;
    const b = (await (await checkin("T2")).json()) as CheckInResponse;
    expect(a.checkinToken).not.toBe(b.checkinToken);
  });

  it("check-out at a free table returns 409 TABLE_NOT_OCCUPIED", async () => {
    const res = await checkout("T1", tokenBody("any"));
    expect(res.status).toBe(409);
    expect(await errorCode(res)).toBe("TABLE_NOT_OCCUPIED");
  });

  it.each([
    ["no body", undefined],
    ["invalid JSON", "{not json"],
    ["missing token", "{}"],
    ["token not a string", tokenBody(42)],
    ["JSON null", "null"],
  ])("check-out with %s returns 400 INVALID_BODY", async (_case, body) => {
    await checkin("T1");
    const res = await checkout("T1", body);
    expect(res.status).toBe(400);
    expect(await errorCode(res)).toBe("INVALID_BODY");
  });

  it("unknown table returns 404 TABLE_NOT_FOUND, before checking the body", async () => {
    const resIn = await checkin("T99");
    const resOut = await checkout("T99", "{not json");
    expect([resIn.status, resOut.status]).toEqual([404, 404]);
    expect(await errorCode(resIn)).toBe("TABLE_NOT_FOUND");
    expect(await errorCode(resOut)).toBe("TABLE_NOT_FOUND");
  });
});
