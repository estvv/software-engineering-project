// C4 Status Store: the current check-in of each table, kept in memory.
// Restarting the server clears it (temporary data, see API_contract.md section 5).

export interface CheckIn {
  token: string;
  checkedInAt: Date;
}

export interface StatusStore {
  get(tableId: string): CheckIn | undefined;
  set(tableId: string, checkIn: CheckIn): void;
  delete(tableId: string): void;
}

export function createMemoryStore(): StatusStore {
  const checkIns = new Map<string, CheckIn>();
  return {
    get: (tableId) => checkIns.get(tableId),
    set: (tableId, checkIn) => {
      checkIns.set(tableId, checkIn);
    },
    delete: (tableId) => {
      checkIns.delete(tableId);
    },
  };
}

// One store for the whole server. Kept on globalThis so that hot reload in
// `next dev` does not create a new, empty store.
const globalForStore = globalThis as unknown as { statusStore?: StatusStore };

export const statusStore: StatusStore =
  globalForStore.statusStore ?? (globalForStore.statusStore = createMemoryStore());
