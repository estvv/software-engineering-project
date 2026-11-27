// GET /api/tables (docs/API_contract.md, section 2.1).

import { errorResponse, noStore } from "@/lib/apiErrors";
import { getLayout } from "@/lib/layout";
import { getTableStatuses } from "@/lib/seatStatus";
import { getStatusStore } from "@/lib/statusStore";

// Statuses change during lunch: never prerender or cache this route.
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const body = await getTableStatuses(getLayout(), getStatusStore(), new Date());
    return Response.json(body, { headers: noStore });
  } catch (error) {
    // Logged for the operator (e.g. database down); the student sees a generic message.
    console.error("[C2] GET /api/tables failed:", error);
    return errorResponse("INTERNAL_ERROR");
  }
}
