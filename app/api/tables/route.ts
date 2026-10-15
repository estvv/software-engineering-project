// GET /api/tables (docs/API_contract.md, section 2.1).

import { errorResponse, noStore } from "@/lib/apiErrors";
import { getLayout } from "@/lib/layout";
import { getTableStatuses } from "@/lib/seatStatus";
import { statusStore } from "@/lib/statusStore";

// Statuses change during lunch: never prerender or cache this route.
export const dynamic = "force-dynamic";

export function GET(): Response {
  try {
    const body = getTableStatuses(getLayout(), statusStore, new Date());
    return Response.json(body, { headers: noStore });
  } catch {
    return errorResponse("INTERNAL_ERROR");
  }
}
