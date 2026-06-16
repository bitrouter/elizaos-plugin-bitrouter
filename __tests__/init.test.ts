import { afterEach, describe, expect, it, vi } from "vitest";
import { initializeBitRouter } from "../src/init";

function runtime(settings: Record<string, string | undefined>) {
  return { getSetting: (k: string) => settings[k] } as unknown as Parameters<
    typeof initializeBitRouter
  >[1];
}

afterEach(() => vi.restoreAllMocks());

describe("initializeBitRouter", () => {
  it("does not throw when the key is missing", async () => {
    await expect(initializeBitRouter({}, runtime({}))).resolves.toBeUndefined();
  });

  it("validates the key with GET /v1/models and does not throw on a bad response", async () => {
    const fetchMock = vi.fn(async () => ({ ok: false, statusText: "Unauthorized" }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      initializeBitRouter({}, runtime({ BITROUTER_API_KEY: "brvk_x" })),
    ).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:4356/v1/models",
      expect.objectContaining({ headers: { Authorization: "Bearer brvk_x" } }),
    );
  });
});
