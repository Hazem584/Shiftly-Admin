import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const session = vi.hoisted(() => vi.fn());
vi.mock("../auth/supabase-client", () => ({
  supabase: { auth: { getSession: session } },
}));
import { request } from "./http-client";

const never = () => new Promise<never>(() => {});
describe("admin request cancellation and deadline", () => {
  const fetch = vi.fn();
  beforeEach(() => {
    vi.useFakeTimers();
    session
      .mockReset()
      .mockResolvedValue({ data: { session: { access_token: "test-token" } } });
    fetch.mockReset();
    vi.stubGlobal("fetch", fetch);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
  it.each([true, false])(
    "enforces 30 seconds even when caller signal is supplied: %s",
    async (supplied) => {
      fetch.mockImplementation(never);
      const caller = new AbortController();
      const pending = request(
        "users",
        supplied ? { signal: caller.signal } : {},
      );
      const result = pending.catch((error) => error);
      await vi.advanceTimersByTimeAsync(30_000);
      expect(await result).toMatchObject({
        code: "REQUEST_TIMEOUT",
        status: 408,
      });
      expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
      expect(caller.signal.aborted).toBe(false);
      expect(vi.getTimerCount()).toBe(0);
    },
  );
  it("preserves caller cancellation and releases its deadline", async () => {
    fetch.mockImplementation(never);
    const caller = new AbortController();
    const result = request("users", { signal: caller.signal }).catch(
      (error) => error,
    );
    await vi.advanceTimersByTimeAsync(0);
    const reason = new DOMException("Page closed", "AbortError");
    caller.abort(reason);
    expect(await result).toBe(reason);
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("does not start authentication or fetch for a cancelled request", async () => {
    const caller = new AbortController();
    caller.abort();
    await expect(
      request("users", { signal: caller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(session).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
  it("times out stalled authentication and stalled response bodies too", async () => {
    session.mockImplementationOnce(never);
    const auth = request("users").catch((error) => error);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(await auth).toMatchObject({ code: "REQUEST_TIMEOUT" });
    expect(fetch).not.toHaveBeenCalled();
    fetch.mockResolvedValue({ ok: true, json: never });
    const body = request("users", {
      signal: new AbortController().signal,
    }).catch((error) => error);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(await body).toMatchObject({ code: "REQUEST_TIMEOUT" });
  });
  it("keeps the first abort cause when cancellation happens after timeout", async () => {
    fetch.mockImplementation(never);
    const caller = new AbortController();
    const result = request("users", { signal: caller.signal }).catch(
      (error) => error,
    );
    await vi.advanceTimersByTimeAsync(30_000);
    caller.abort();
    expect(await result).toMatchObject({ code: "REQUEST_TIMEOUT" });
  });
  it("completes successfully and clears abort listeners and timers", async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ saved: true }) });
    const caller = new AbortController();
    const remove = vi.spyOn(caller.signal, "removeEventListener");
    expect(
      await request("releases", { signal: caller.signal, method: "PUT" }),
    ).toEqual({ saved: true });
    expect(remove).toHaveBeenCalledWith("abort", expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: "PUT",
      cache: "no-store",
      headers: { Authorization: "Bearer test-token" },
    });
  });
  it("distinguishes network failures and preserves API error codes", async () => {
    fetch.mockRejectedValueOnce(new TypeError("fetch failed"));
    await expect(request("users")).rejects.toMatchObject({
      code: "NETWORK_ERROR",
    });
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ code: "CONFLICT" }),
    });
    await expect(request("releases")).rejects.toMatchObject({
      code: "CONFLICT",
      status: 409,
    });
    expect(vi.getTimerCount()).toBe(0);
  });
});
