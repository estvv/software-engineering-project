// C4 contract tests: the same checks run on the memory store and, when
// TEST_DATABASE_URL is set (CI, docker compose), on the PostgreSQL store.
// Table IDs start with "test-" so these tests never touch real data.

import { Pool } from "pg";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createMemoryStore, createPostgresStore, type StatusStore } from "./statusStore";

const NOW = new Date("2026-11-12T12:00:00Z");
const HOUR_AGO = new Date(NOW.getTime() - 60 * 60 * 1000);
const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60 * 1000);
const ID = "test-T1";

const pgUrl = process.env.TEST_DATABASE_URL;
const pool = pgUrl ? new Pool({ connectionString: pgUrl }) : undefined;
afterAll(() => pool?.end());

const stores: [string, (() => StatusStore) | undefined][] = [
  ["memory", createMemoryStore],
  ["postgres", pool && (() => createPostgresStore(pool))],
];

describe.each(stores)("C4 %s store", (name, make) => {
  if (!make) {
    it.skip(`skipped: set TEST_DATABASE_URL to run the ${name} store tests`, () => {});
    return;
  }
  let store: StatusStore;

  beforeEach(async () => {
    store = make();
    for (let i = 0; i < 20; i++) await store.delete(`test-T${i}`);
    await store.delete(ID);
  });

  it("set then get returns the same check-in, and delete removes it", async () => {
    await store.set(ID, { token: "a", checkedInAt: minutesAgo(5) });
    expect(await store.get(ID)).toEqual({ token: "a", checkedInAt: minutesAgo(5) });
    expect((await store.getAll()).get(ID)?.token).toBe("a");

    await store.delete(ID);
    expect(await store.get(ID)).toBeUndefined();
  });

  it("R1: claim refuses a table with an active check-in", async () => {
    await store.set(ID, { token: "first", checkedInAt: minutesAgo(5) });

    expect(await store.claim(ID, { token: "second", checkedInAt: NOW }, HOUR_AGO)).toBe(false);
    expect((await store.get(ID))?.token).toBe("first");
  });

  it("R2: claim replaces a check-in made exactly 60 minutes ago", async () => {
    await store.set(ID, { token: "old", checkedInAt: HOUR_AGO });

    expect(await store.claim(ID, { token: "new", checkedInAt: NOW }, HOUR_AGO)).toBe(true);
    expect((await store.get(ID))?.token).toBe("new");
  });

  it("release needs the right token and an active check-in", async () => {
    await store.set(ID, { token: "mine", checkedInAt: minutesAgo(5) });
    expect(await store.release(ID, "not-mine", HOUR_AGO)).toBe(false);
    expect(await store.release(ID, "mine", HOUR_AGO)).toBe(true);
    expect(await store.get(ID)).toBeUndefined();

    await store.set(ID, { token: "mine", checkedInAt: HOUR_AGO });
    expect(await store.release(ID, "mine", HOUR_AGO)).toBe(false);
  });

  it("R1 under concurrency: 20 simultaneous claims on one table, exactly one wins", async () => {
    const results = await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        store.claim(ID, { token: `t${i}`, checkedInAt: NOW }, HOUR_AGO),
      ),
    );

    expect(results.filter(Boolean)).toHaveLength(1);
    const winner = results.indexOf(true);
    expect((await store.get(ID))?.token).toBe(`t${winner}`);
  });
});
