import { describe, expect, it } from "vitest";
import {
  DEFAULT_BASE_URL,
  getApiKey,
  getBaseURL,
  getLargeModel,
  getObjectModel,
  getSmallModel,
} from "../src/utils/config";

function runtimeWith(settings: Record<string, string | undefined>) {
  return {
    getSetting: (key: string) => settings[key],
  } as unknown as Parameters<typeof getBaseURL>[0];
}

describe("config", () => {
  it("falls back to the default base URL", () => {
    expect(getBaseURL(runtimeWith({}))).toBe(DEFAULT_BASE_URL);
  });

  it("prefers an explicit base URL setting", () => {
    expect(getBaseURL(runtimeWith({ BITROUTER_BASE_URL: "http://x:1/" }))).toBe("http://x:1/");
  });

  it("reads the API key", () => {
    expect(getApiKey(runtimeWith({ BITROUTER_API_KEY: "brvk_abc" }))).toBe("brvk_abc");
    expect(getApiKey(runtimeWith({}))).toBeUndefined();
  });

  it("resolves the small model from settings, else default", () => {
    expect(getSmallModel(runtimeWith({ BITROUTER_SMALL_MODEL: "m-s" }))).toBe("m-s");
    expect(getSmallModel(runtimeWith({}))).toBeTruthy();
  });

  it("object model falls back to large when unset", () => {
    const rt = runtimeWith({ BITROUTER_LARGE_MODEL: "large-x" });
    expect(getObjectModel(rt)).toBe("large-x");
  });

  it("explicit large model wins", () => {
    expect(getLargeModel(runtimeWith({ BITROUTER_LARGE_MODEL: "L" }))).toBe("L");
  });

});
