// C4 Status Store: the current check-in of each table.
// With DATABASE_URL set, check-ins are kept in PostgreSQL and survive a restart
// (issue #35). Without it, they are kept in memory (tests, quick local runs).

import { Pool } from "pg";

export interface CheckIn {
  token: string;
  checkedInAt: Date;
}

/**
 * The store keeps no rules of its own: C2 passes `activeSince` (now minus the
 * R2 duration). A check-in is active when it was made strictly after it.
 * `claim` and `release` are atomic, so two students clicking at the same time
 * cannot both get the same table (rule R1).
 */
export interface StatusStore {
  get(tableId: string): Promise<CheckIn | undefined>;
  getAll(): Promise<Map<string, CheckIn>>;
  /** Saves the check-in unless the table has an active one. True if saved. */
  claim(tableId: string, checkIn: CheckIn, activeSince: Date): Promise<boolean>;
  /** Deletes the table's active check-in if the token matches. True if deleted. */
  release(tableId: string, token: string, activeSince: Date): Promise<boolean>;
  /** Overwrites the check-in, without any rule. Used to prepare tests. */
  set(tableId: string, checkIn: CheckIn): Promise<void>;
  delete(tableId: string): Promise<void>;
}

const isActive = (c: CheckIn | undefined, activeSince: Date): c is CheckIn =>
  c !== undefined && c.checkedInAt.getTime() > activeSince.getTime();

export function createMemoryStore(): StatusStore {
  const checkIns = new Map<string, CheckIn>();
  return {
    get: async (tableId) => checkIns.get(tableId),
    getAll: async () => new Map(checkIns),
    claim: async (tableId, checkIn, activeSince) => {
      if (isActive(checkIns.get(tableId), activeSince)) return false;
      checkIns.set(tableId, checkIn);
      return true;
    },
    release: async (tableId, token, activeSince) => {
      const current = checkIns.get(tableId);
      if (!isActive(current, activeSince) || current.token !== token) return false;
      checkIns.delete(tableId);
      return true;
    },
    set: async (tableId, checkIn) => {
      checkIns.set(tableId, checkIn);
    },
    delete: async (tableId) => {
      checkIns.delete(tableId);
    },
  };
}

// Table names are fixed here, never built from user input.
const SCHEMA_LOCK_ID = 4133;
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS checkins (
    table_id      text        PRIMARY KEY,
    token         text        NOT NULL,
    checked_in_at timestamptz NOT NULL
  )`;

interface CheckInRow {
  table_id: string;
  token: string;
  checked_in_at: Date;
}

const toCheckIn = (row: CheckInRow): CheckIn => ({
  token: row.token,
  checkedInAt: row.checked_in_at,
});

export function createPostgresStore(pool: Pool): StatusStore {
  let schemaReady: Promise<void> | undefined;

  // Creates the table on first use. The advisory lock stops two server
  // processes from running CREATE TABLE at the same moment.
  function ready(): Promise<void> {
    schemaReady ??= (async () => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock($1)", [SCHEMA_LOCK_ID]);
        await client.query(SCHEMA);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        schemaReady = undefined; // retry on the next request
        throw error;
      } finally {
        client.release();
      }
    })();
    return schemaReady;
  }

  async function query<R extends object>(text: string, values: unknown[] = []) {
    await ready();
    return pool.query<R>(text, values);
  }

  return {
    get: async (tableId) => {
      const { rows } = await query<CheckInRow>(
        "SELECT table_id, token, checked_in_at FROM checkins WHERE table_id = $1",
        [tableId],
      );
      return rows[0] ? toCheckIn(rows[0]) : undefined;
    },
    getAll: async () => {
      const { rows } = await query<CheckInRow>("SELECT table_id, token, checked_in_at FROM checkins");
      return new Map(rows.map((r) => [r.table_id, toCheckIn(r)]));
    },
    claim: async (tableId, checkIn, activeSince) => {
      // One statement: PostgreSQL locks the row, so a concurrent claim waits,
      // then sees the new check-in as active and does nothing.
      const { rowCount } = await query(
        `INSERT INTO checkins (table_id, token, checked_in_at) VALUES ($1, $2, $3)
         ON CONFLICT (table_id) DO UPDATE
           SET token = EXCLUDED.token, checked_in_at = EXCLUDED.checked_in_at
           WHERE checkins.checked_in_at <= $4`,
        [tableId, checkIn.token, checkIn.checkedInAt, activeSince],
      );
      return rowCount === 1;
    },
    release: async (tableId, token, activeSince) => {
      const { rowCount } = await query(
        "DELETE FROM checkins WHERE table_id = $1 AND token = $2 AND checked_in_at > $3",
        [tableId, token, activeSince],
      );
      return rowCount === 1;
    },
    set: async (tableId, checkIn) => {
      await query(
        `INSERT INTO checkins (table_id, token, checked_in_at) VALUES ($1, $2, $3)
         ON CONFLICT (table_id) DO UPDATE
           SET token = EXCLUDED.token, checked_in_at = EXCLUDED.checked_in_at`,
        [tableId, checkIn.token, checkIn.checkedInAt],
      );
    },
    delete: async (tableId) => {
      await query("DELETE FROM checkins WHERE table_id = $1", [tableId]);
    },
  };
}

// One store for the whole server, created on first use (not at import, so
// `next build` needs no database). Kept on globalThis so that hot reload in
// `next dev` does not open a new pool or empty the memory store.
const globalForStore = globalThis as unknown as { statusStore?: StatusStore };

export function getStatusStore(): StatusStore {
  if (globalForStore.statusStore) return globalForStore.statusStore;
  const url = process.env.DATABASE_URL;
  if (url) {
    globalForStore.statusStore = createPostgresStore(new Pool({ connectionString: url, max: 10 }));
  } else {
    console.warn("[C4] DATABASE_URL is not set: check-ins are kept in memory and lost on restart.");
    globalForStore.statusStore = createMemoryStore();
  }
  return globalForStore.statusStore;
}
