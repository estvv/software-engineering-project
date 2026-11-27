// GET /api/tables (docs/API_contract.md, section 2.1).

import { errorResponse, noStore } from "@/lib/apiErrors";
import { logError } from "@/lib/log";
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
    // Not logged on success: the map polls every 5 s per open page.
    logError("tables.failed", error);
    return errorResponse("INTERNAL_ERROR");
  }
}
