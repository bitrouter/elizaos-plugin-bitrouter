import { describe, expect, it, vi } from "vitest";
import { ModelType } from "@elizaos/core";

const { generateText } = vi.hoisted(() => ({
  generateText: vi.fn(async () => ({
    text: "hello world",
    usage: { inputTokens: 4, outputTokens: 2, totalTokens: 6 },
  })),
}));
vi.mock("ai", () => ({ generateText }));
vi.mock("@ai-sdk/openai-compatible", () => ({
  createOpenAICompatible: () => ({ chatModel: (id: string) => ({ id }) }),
}));

import { handleText } from "../src/models/text";

function runtime() {
  return {
    getSetting: (k: string) =>
      ({ BITROUTER_LARGE_MODEL: "big" } as Record<string, string>)[k],
    emitEvent: vi.fn(),
  } as unknown as Parameters<typeof handleText>[0];
}

describe("handleText", () => {
  it("returns generated text and forwards prompt + params", async () => {
    const rt = runtime();
    const out = await handleText(
      rt,
      { prompt: "hi", temperature: 0.7, maxTokens: 100 },
      ModelType.TEXT_LARGE,
      "big",
    );
    expect(out).toBe("hello world");
    const call = generateText.mock.calls.at(-1)![0];
    expect(call.prompt).toBe("hi");
    expect(call.temperature).toBe(0.7);
    expect(call.maxOutputTokens).toBe(100);
  });
});
