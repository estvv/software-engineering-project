// Error responses of the API (docs/API_contract.md, section 4).

import type { ErrorBody, ErrorCode } from "./types";

const errors: Record<ErrorCode, { status: number; message: string }> = {
  TABLE_NOT_FOUND: { status: 404, message: "This table does not exist." },
  INVALID_BODY: { status: 400, message: "Something went wrong, please retry." },
  TABLE_OCCUPIED: { status: 409, message: "Table already occupied." },
  TABLE_NOT_OCCUPIED: { status: 409, message: "You are not checked in at this table." },
  INVALID_TOKEN: { status: 403, message: "Only the student who checked in can free this table." },
  INTERNAL_ERROR: { status: 500, message: "Something went wrong, please retry." },
};

export const noStore = { "Cache-Control": "no-store" };

export function errorResponse(code: ErrorCode): Response {
  const { status, message } = errors[code];
  const body: ErrorBody = { error: { code, message } };
  return Response.json(body, { status, headers: noStore });
}
