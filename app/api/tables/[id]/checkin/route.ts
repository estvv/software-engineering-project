// POST /api/tables/{id}/checkin (docs/API_contract.md, section 2.2).

import { randomUUID } from "node:crypto";
import { errorResponse, noStore } from "@/lib/apiErrors";
import { getLayout } from "@/lib/layout";
import { checkIn } from "@/lib/seatStatus";
import { statusStore } from "@/lib/statusStore";
import type { CheckInResponse } from "@/lib/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await params;
    const result = checkIn(getLayout(), statusStore, id, new Date(), randomUUID);
    if (!result.ok) return errorResponse(result.code);

    const body: CheckInResponse = {
      table: result.table,
      checkinToken: result.checkinToken,
      expiresAt: result.expiresAt.toISOString(),
    };
    return Response.json(body, { status: 201, headers: noStore });
  } catch {
    return errorResponse("INTERNAL_ERROR");
  }
}
