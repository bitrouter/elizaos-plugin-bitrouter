import { describe, expect, it } from "vitest";
import { ModelType } from "@elizaos/core";
import { bitrouterPlugin } from "../src/index";

describe("bitrouterPlugin manifest", () => {
  it("declares name, config and init", () => {
    expect(bitrouterPlugin.name).toBe("bitrouter");
    expect(bitrouterPlugin.config).toHaveProperty("BITROUTER_API_KEY");
    expect(typeof bitrouterPlugin.init).toBe("function");
  });

  it("registers exactly the v1 text + object model types", () => {
    const keys = Object.keys(bitrouterPlugin.models ?? {}).sort();
    expect(keys).toEqual(
      [
        ModelType.TEXT_SMALL,
        ModelType.TEXT_LARGE,
        ModelType.OBJECT_SMALL,
        ModelType.OBJECT_LARGE,
      ]
        .map(String)
        .sort(),
    );
  });

  it("does NOT register embeddings or media types", () => {
    const models = bitrouterPlugin.models ?? {};
    expect(models[ModelType.TEXT_EMBEDDING]).toBeUndefined();
    expect(models[ModelType.IMAGE]).toBeUndefined();
    expect(models[ModelType.TRANSCRIPTION]).toBeUndefined();
  });
});
