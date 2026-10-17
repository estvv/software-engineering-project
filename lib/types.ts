// Shapes shared by C1 and C2. They follow docs/API_contract.md, section 1.

export type TableStatus = "free" | "occupied";

/** One table of the layout (C3). */
export interface LayoutTable {
  id: string;
  row: number;
  col: number;
}

/** Table representation returned by the API. */
export interface Table extends LayoutTable {
  status: TableStatus;
}

/** Result of GET /api/tables. */
export interface TablesResponse {
  tables: Table[];
  noFreeTable: boolean;
}

export type ErrorCode =
  | "TABLE_NOT_FOUND"
  | "INVALID_BODY"
  | "TABLE_OCCUPIED"
  | "TABLE_NOT_OCCUPIED"
  | "INVALID_TOKEN"
  | "INTERNAL_ERROR";

/** Body of POST /api/tables/{id}/checkin, status 201. */
export interface CheckInResponse {
  table: Table;
  checkinToken: string;
  expiresAt: string;
}

/** Body of POST /api/tables/{id}/checkout, status 200. */
export interface CheckOutResponse {
  table: Table;
}

export interface ErrorBody {
  error: { code: ErrorCode; message: string };
}
