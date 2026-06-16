import { describe, expect, it, vi } from "vitest";
import { ModelType } from "@elizaos/core";

const { generateObject, jsonSchema } = vi.hoisted(() => ({
  generateObject: vi.fn(async () => ({
    object: { message: "hi" },
    usage: { inputTokens: 3, outputTokens: 1, totalTokens: 4 },
  })),
  jsonSchema: vi.fn((s: unknown) => ({ schema: s })),
}));
vi.mock("ai", () => ({ generateObject, jsonSchema }));
vi.mock("@ai-sdk/openai-compatible", () => ({
  createOpenAICompatible: () => ({ chatModel: (id: string) => ({ id }) }),
}));

import { handleObject } from "../src/models/object";

function runtime() {
  return {
    getSetting: (k: string) => ({ BITROUTER_LARGE_MODEL: "big" } as Record<string, string>)[k],
    emitEvent: vi.fn(),
  } as unknown as Parameters<typeof handleObject>[0];
}

describe("handleObject", () => {
  it("returns the parsed object and passes the json schema", async () => {
    const rt = runtime();
    const schema = { type: "object", properties: { message: { type: "string" } } };
    const out = await handleObject(rt, { prompt: "make json", schema }, ModelType.OBJECT_LARGE);
    expect(out).toEqual({ message: "hi" });
    expect(jsonSchema).toHaveBeenCalledWith(schema);
    const call = generateObject.mock.calls.at(-1)![0];
    expect(call.prompt).toBe("make json");
  });

  it("works without a schema (no-schema mode) and does not call jsonSchema", async () => {
    const rt = runtime();
    jsonSchema.mockClear();
    const out = await handleObject(rt, { prompt: "freeform json" }, ModelType.OBJECT_SMALL);
    expect(out).toEqual({ message: "hi" });
    expect(jsonSchema).not.toHaveBeenCalled();
    const call = generateObject.mock.calls.at(-1)![0];
    expect(call.output).toBe("no-schema");
  });
});
