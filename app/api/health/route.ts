// GET /api/health (Week 13, observability): used by the Docker healthcheck and
// by the operator. 200 when the app and its store answer, 503 otherwise.

import { noStore } from "@/lib/apiErrors";
import { logError } from "@/lib/log";
import { getStatusStore } from "@/lib/statusStore";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const store = getStatusStore();
  try {
    await store.ping();
    return Response.json({ status: "ok", store: store.kind }, { headers: noStore });
  } catch (error) {
    logError("health.store_unreachable", error, { store: store.kind });
    return Response.json({ status: "unavailable", store: store.kind }, { status: 503, headers: noStore });
  }
}
