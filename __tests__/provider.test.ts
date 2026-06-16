import { describe, expect, it, vi } from "vitest";

const { createOpenAICompatible } = vi.hoisted(() => ({
  createOpenAICompatible: vi.fn(() => ({ chatModel: (id: string) => ({ id }) })),
}));
vi.mock("@ai-sdk/openai-compatible", () => ({ createOpenAICompatible }));

import { createBitRouterProvider } from "../src/provider";

function runtimeWith(settings: Record<string, string | undefined>) {
  return { getSetting: (k: string) => settings[k] } as unknown as Parameters<
    typeof createBitRouterProvider
  >[0];
}

describe("createBitRouterProvider", () => {
  it("appends /v1 to the base URL and passes the api key", () => {
    createBitRouterProvider(runtimeWith({ BITROUTER_BASE_URL: "http://h:9", BITROUTER_API_KEY: "brvk_1" }));
    expect(createOpenAICompatible).toHaveBeenCalledWith(
      expect.objectContaining({ name: "bitrouter", baseURL: "http://h:9/v1", apiKey: "brvk_1" }),
    );
  });

  it("uses a localhost placeholder key when none is set", () => {
    createBitRouterProvider(runtimeWith({ BITROUTER_BASE_URL: "http://h:9/" }));
    expect(createOpenAICompatible).toHaveBeenLastCalledWith(
      expect.objectContaining({ baseURL: "http://h:9/v1", apiKey: "bitrouter-local" }),
    );
  });
});
