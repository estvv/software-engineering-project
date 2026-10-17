// GET /api/tables (docs/API_contract.md, section 2.1).

import { getLayout } from "@/lib/layout";
import { getTableStatuses } from "@/lib/seatStatus";
import { statusStore } from "@/lib/statusStore";
import type { ErrorBody } from "@/lib/types";

// Statuses change during lunch: never prerender or cache this route.
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export function GET(): Response {
  try {
    const body = getTableStatuses(getLayout(), statusStore, new Date());
    return Response.json(body, { headers: noStore });
  } catch {
    const body: ErrorBody = {
      error: { code: "INTERNAL_ERROR", message: "Something went wrong, please retry." },
    };
    return Response.json(body, { status: 500, headers: noStore });
  }
}
