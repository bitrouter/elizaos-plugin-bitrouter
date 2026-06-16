import { beforeEach, describe, expect, it, vi } from "vitest";
import { ModelType } from "@elizaos/core";

const { generateText, generateObject, jsonSchema } = vi.hoisted(() => ({
  generateText: vi.fn(async () => ({
    text: "hello world",
    usage: { inputTokens: 4, outputTokens: 2, totalTokens: 6 },
  })),
  generateObject: vi.fn(async () => ({
    object: { ok: true },
    usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
  })),
  jsonSchema: vi.fn((s: unknown) => ({ schema: s })),
}));
vi.mock("ai", () => ({ generateText, generateObject, jsonSchema }));
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
  beforeEach(() => {
    generateText.mockClear();
    generateObject.mockClear();
    jsonSchema.mockClear();
  });

  it("plain text: returns generated text and forwards params", async () => {
    const rt = runtime();
    const out = await handleText(
      rt,
      {
        prompt: "hi",
        temperature: 0.7,
        maxTokens: 100,
        topP: 0.9,
        seed: 42,
        stopSequences: ["stop"],
        frequencyPenalty: 0.1,
        presencePenalty: 0.2,
      },
      ModelType.TEXT_LARGE,
      "big",
    );
    expect(out).toBe("hello world");
    const call = generateText.mock.calls.at(-1)![0];
    expect(call.prompt).toBe("hi");
    expect(call.temperature).toBe(0.7);
    expect(call.maxOutputTokens).toBe(100);
    expect(generateObject).not.toHaveBeenCalled();
    expect(rt.emitEvent).toHaveBeenCalled();
  });

  it("structured output: returns JSON.stringify of object and uses generateObject", async () => {
    const rt = runtime();
    const schema = { type: "object" };
    const out = await handleText(
      rt,
      { prompt: "p", responseSchema: schema },
      ModelType.TEXT_LARGE,
      "big",
    );
    expect(out).toBe(JSON.stringify({ ok: true }));
    expect(generateObject).toHaveBeenCalledOnce();
    expect(jsonSchema).toHaveBeenCalledWith(schema);
    expect(generateText).not.toHaveBeenCalled();
  });
});
