import { describe, expect, it } from "vitest";
import { ModelType } from "@elizaos/core";
import { bitrouterPlugin } from "../src/index";

describe("bitrouterPlugin manifest", () => {
  it("declares name, autoEnable and init", () => {
    expect(bitrouterPlugin.name).toBe("bitrouter");
    expect(bitrouterPlugin.autoEnable?.envKeys).toContain("BITROUTER_API_KEY");
    expect(typeof bitrouterPlugin.init).toBe("function");
  });

  it("registers exactly the 7 text model types", () => {
    const keys = Object.keys(bitrouterPlugin.models ?? {}).sort();
    const expected = [
      ModelType.TEXT_NANO,
      ModelType.TEXT_SMALL,
      ModelType.TEXT_MEDIUM,
      ModelType.TEXT_LARGE,
      ModelType.TEXT_MEGA,
      ModelType.RESPONSE_HANDLER,
      ModelType.ACTION_PLANNER,
    ]
      .map(String)
      .sort();
    expect(keys).toEqual(expected);
  });

  it("does NOT register OBJECT_SMALL, OBJECT_LARGE, embeddings, or media types", () => {
    const models = bitrouterPlugin.models ?? {};
    // @ts-expect-error — intentionally testing removed keys
    expect(models[ModelType.OBJECT_SMALL]).toBeUndefined();
    // @ts-expect-error — intentionally testing removed keys
    expect(models[ModelType.OBJECT_LARGE]).toBeUndefined();
    expect(models[ModelType.TEXT_EMBEDDING]).toBeUndefined();
    expect(models[ModelType.IMAGE]).toBeUndefined();
  });
});
