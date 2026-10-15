// POST /api/tables/{id}/checkout (docs/API_contract.md, section 2.3).

import { errorResponse, noStore } from "@/lib/apiErrors";
import { getLayout } from "@/lib/layout";
import { checkOut, tableExists } from "@/lib/seatStatus";
import { statusStore } from "@/lib/statusStore";
import type { CheckOutResponse } from "@/lib/types";

/** Reads `checkinToken` from the JSON body, or null if the body is invalid. */
async function readToken(request: Request): Promise<string | null> {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null) return null;
    const token = (body as { checkinToken?: unknown }).checkinToken;
    return typeof token === "string" ? token : null;
  } catch {
    return null;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await params;
    const layout = getLayout();
    // Order of checks follows the contract: 404, then 400, then the domain rules.
    if (!tableExists(layout, id)) return errorResponse("TABLE_NOT_FOUND");
    const token = await readToken(request);
    if (token === null) return errorResponse("INVALID_BODY");

    const result = checkOut(layout, statusStore, id, token, new Date());
    if (!result.ok) return errorResponse(result.code);

    const body: CheckOutResponse = { table: result.table };
    return Response.json(body, { headers: noStore });
  } catch {
    return errorResponse("INTERNAL_ERROR");
  }
}
