// POST /api/tables/{id}/company (docs/API_contract.md, section 2.4): S3 "open to company".

import { errorResponse, noStore } from "@/lib/apiErrors";
import { getLayout } from "@/lib/layout";
import { logError, logEvent } from "@/lib/log";
import { readJsonObject } from "@/lib/requestBody";
import { setOpenToCompany, tableExists } from "@/lib/seatStatus";
import { getStatusStore } from "@/lib/statusStore";
import type { CompanyResponse } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await params;
    const layout = getLayout();
    // Same order of checks as check-out: 404, then 400, then the domain rules.
    if (!tableExists(layout, id)) return errorResponse("TABLE_NOT_FOUND");
    const body = await readJsonObject(request);
    if (typeof body?.checkinToken !== "string" || typeof body.open !== "boolean") {
      return errorResponse("INVALID_BODY");
    }

    const result = await setOpenToCompany(layout, getStatusStore(), id, body.checkinToken, body.open, new Date());
    logEvent("company", { table: id, open: body.open, result: result.ok ? "ok" : result.code });
    if (!result.ok) return errorResponse(result.code);

    const response: CompanyResponse = { table: result.table };
    return Response.json(response, { headers: noStore });
  } catch (error) {
    logError("company.failed", error);
    return errorResponse("INTERNAL_ERROR");
  }
}
