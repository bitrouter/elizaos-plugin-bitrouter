import { describe, expect, it, vi } from "vitest";
import { ModelType } from "@elizaos/core";
import { emitModelUsageEvent } from "../src/utils/events";

describe("emitModelUsageEvent", () => {
  it("normalizes usage and emits MODEL_USED", () => {
    const emitEvent = vi.fn();
    const runtime = { emitEvent } as unknown as Parameters<typeof emitModelUsageEvent>[0];

    const result = emitModelUsageEvent(
      runtime,
      ModelType.TEXT_LARGE,
      "hi",
      { inputTokens: 10, outputTokens: 5 },
      "gpt-4o",
    );

    expect(result).toEqual({ promptTokens: 10, completionTokens: 5, totalTokens: 15 });
    expect(emitEvent).toHaveBeenCalledTimes(1);
    const payload = emitEvent.mock.calls[0][1];
    expect(payload.provider).toBe("bitrouter");
    expect(payload.model).toBe("gpt-4o");
    expect(payload.tokens).toEqual({ prompt: 10, completion: 5, total: 15 });
  });

  it("falls back to prompt/completion token fields", () => {
    const emitEvent = vi.fn();
    const runtime = { emitEvent } as unknown as Parameters<typeof emitModelUsageEvent>[0];
    const result = emitModelUsageEvent(runtime, ModelType.TEXT_SMALL, "x", {
      promptTokens: 3,
      completionTokens: 4,
    });
    expect(result.totalTokens).toBe(7);
  });
});
