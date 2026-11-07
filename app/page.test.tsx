// @vitest-environment jsdom
// C1 tests: the map follows the API without a reload. The API is replaced by a
// fake `fetch`, so these tests say nothing about C2 (see the route tests).

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TableStatus, TablesResponse } from "@/lib/types";
import Home from "./page";

function tables(t1: TableStatus): TablesResponse {
  return {
    tables: [
      { id: "T1", row: 0, col: 0, status: t1 },
      { id: "T2", row: 0, col: 1, status: "free" },
    ],
    noFreeTable: false,
  };
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

const fetchMock = vi.fn<typeof fetch>();

/** Lets pending promises settle, then advances the fake clock. */
const advance = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

const t1Label = () => screen.getByRole("button", { name: /^T1/ }).textContent;

describe("C1 automatic map refresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("shows another student's check-in within 10 s, without a reload", async () => {
    fetchMock.mockImplementationOnce(async () => json(tables("free")));
    fetchMock.mockImplementation(async () => json(tables("occupied")));
    render(<Home />);
    await advance(0);
    expect(t1Label()).toContain("free");

    await advance(10_000);
    expect(t1Label()).toContain("occupied");
  });

  it("does not poll while the tab is hidden", async () => {
    fetchMock.mockImplementation(async () => json(tables("free")));
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    render(<Home />);
    await advance(20_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("stops polling when the page is left", async () => {
    fetchMock.mockImplementation(async () => json(tables("free")));
    const { unmount } = render(<Home />);
    await advance(0);
    unmount();
    await advance(20_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps the last map and warns when a poll fails, then recovers", async () => {
    fetchMock.mockImplementationOnce(async () => json(tables("free")));
    fetchMock.mockRejectedValueOnce(new TypeError("network down"));
    fetchMock.mockImplementation(async () => json(tables("free")));
    render(<Home />);
    await advance(5_000);
    expect(t1Label()).toContain("free");
    expect(screen.getByText(/map may be out of date/)).toBeTruthy();

    await advance(5_000);
    expect(screen.queryByText(/map may be out of date/)).toBeNull();
  });

  it("ignores a slow poll that finishes after a check-in", async () => {
    let finishPoll: (r: Response) => void = () => {};
    let gets = 0;
    fetchMock.mockImplementation(async (url, init) => {
      if (init?.method === "POST") {
        return json({ table: {}, checkinToken: "tok", expiresAt: new Date().toISOString() }, 201);
      }
      gets += 1;
      if (gets === 1) return json(tables("free"));
      if (gets === 2) return new Promise<Response>((resolve) => (finishPoll = resolve));
      return json(tables("occupied"));
    });
    render(<Home />);
    await advance(5_000); // first load, then a poll that stays pending

    fireEvent.click(screen.getByRole("button", { name: /^T1/ }));
    fireEvent.click(screen.getByRole("button", { name: "I'm sitting here" }));
    await advance(0);
    expect(t1Label()).toContain("occupied");

    finishPoll(json(tables("free")));
    await advance(0);
    expect(t1Label()).toContain("occupied");
  });
});
