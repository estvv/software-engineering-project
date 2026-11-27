// S3 "open to company" through the API (feature tests, no server).
// Acceptance criteria S3-AC1 to S3-AC3: docs/M2_story_slice.md, section 6.

import { beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/tables/route";
import { getLayout } from "@/lib/layout";
import { getStatusStore } from "@/lib/statusStore";
import type { CheckInResponse, ErrorBody, Table, TablesResponse } from "@/lib/types";
import { POST as checkinPOST } from "./checkin/route";
import { POST as checkoutPOST } from "./checkout/route";
import { POST as companyPOST } from "./company/route";

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const post = (body?: string) =>
  new Request("http://localhost/api", { method: "POST", headers: { "Content-Type": "application/json" }, body });
const checkin = async (id: string) =>
  ((await (await checkinPOST(post(), ctx(id))).json()) as CheckInResponse).checkinToken;
const company = (id: string, body: unknown) => companyPOST(post(JSON.stringify(body)), ctx(id));

async function tableOnMap(id: string): Promise<Table | undefined> {
  return ((await (await GET()).json()) as TablesResponse).tables.find((t) => t.id === id);
}
const errorCode = async (res: Response) => ((await res.json()) as ErrorBody).error.code;

describe("POST /api/tables/{id}/company (S3)", () => {
  beforeEach(async () => {
    for (const t of getLayout()) await getStatusStore().delete(t.id);
  });

  it("S3-AC3: a new check-in is not open to company", async () => {
    await checkin("T1");
    expect(await tableOnMap("T1")).toEqual({ id: "T1", row: 0, col: 0, status: "occupied" });
  });

  it("S3-AC1: the student at the table turns it on, and the map shows it", async () => {
    const token = await checkin("T1");

    const res = await company("T1", { checkinToken: token, open: true });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ table: { id: "T1", row: 0, col: 0, status: "occupied", openToCompany: true } });
    expect((await tableOnMap("T1"))?.openToCompany).toBe(true);
  });

  it("S3-AC1: the student can turn it off again", async () => {
    const token = await checkin("T1");
    await company("T1", { checkinToken: token, open: true });

    await company("T1", { checkinToken: token, open: false });

    expect((await tableOnMap("T1"))?.openToCompany).toBeUndefined();
  });

  it("S3-AC2: it ends with the check-in", async () => {
    const token = await checkin("T1");
    await company("T1", { checkinToken: token, open: true });
    await checkoutPOST(post(JSON.stringify({ checkinToken: token })), ctx("T1"));

    expect(await tableOnMap("T1")).toEqual({ id: "T1", row: 0, col: 0, status: "free" });
    await checkin("T1");
    expect((await tableOnMap("T1"))?.openToCompany).toBeUndefined();
  });

  it("S3-AC3: another token cannot turn it on (403)", async () => {
    await checkin("T1");

    const res = await company("T1", { checkinToken: "6f1c2b9e-4a7d-4c1e-9b0a-2d5e8f3a7c10", open: true });

    expect(res.status).toBe(403);
    expect(await errorCode(res)).toBe("INVALID_TOKEN");
    expect((await tableOnMap("T1"))?.openToCompany).toBeUndefined();
  });

  it("a free table returns 409 TABLE_NOT_OCCUPIED", async () => {
    const res = await company("T1", { checkinToken: "any", open: true });
    expect(res.status).toBe(409);
    expect(await errorCode(res)).toBe("TABLE_NOT_OCCUPIED");
  });

  it.each([
    ["missing open", { checkinToken: "x" }],
    ["open not a boolean", { checkinToken: "x", open: "yes" }],
    ["missing token", { open: true }],
  ])("%s returns 400 INVALID_BODY", async (_case, body) => {
    await checkin("T1");
    const res = await company("T1", body);
    expect(res.status).toBe(400);
    expect(await errorCode(res)).toBe("INVALID_BODY");
  });

  it("unknown table returns 404 TABLE_NOT_FOUND", async () => {
    const res = await company("T99", { checkinToken: "x", open: true });
    expect(res.status).toBe(404);
  });
});
