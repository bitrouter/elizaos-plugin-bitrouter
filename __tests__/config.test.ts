import { describe, expect, it } from "vitest";
import {
  DEFAULT_BASE_URL,
  getApiKey,
  getBaseURL,
  getActionPlannerModel,
  getLargeModel,
  getMediumModel,
  getMegaModel,
  getNanoModel,
  getObjectModel,
  getResponseHandlerModel,
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

  it("nano/medium fall back to small when unset", () => {
    const rt = runtimeWith({ BITROUTER_SMALL_MODEL: "small-x" });
    expect(getNanoModel(rt)).toBe("small-x");
    expect(getMediumModel(rt)).toBe("small-x");
  });

  it("mega falls back to large when unset", () => {
    const rt = runtimeWith({ BITROUTER_LARGE_MODEL: "large-x" });
    expect(getMegaModel(rt)).toBe("large-x");
  });

  it("object model falls back to large when unset", () => {
    const rt = runtimeWith({ BITROUTER_LARGE_MODEL: "large-x" });
    expect(getObjectModel(rt)).toBe("large-x");
  });

  it("explicit large model wins", () => {
    expect(getLargeModel(runtimeWith({ BITROUTER_LARGE_MODEL: "L" }))).toBe("L");
  });

  it("response-handler and action-planner fall back to large when unset", () => {
    const rt = runtimeWith({ BITROUTER_LARGE_MODEL: "large-x" });
    expect(getResponseHandlerModel(rt)).toBe("large-x");
    expect(getActionPlannerModel(rt)).toBe("large-x");
  });

  it("response-handler and action-planner prefer their explicit settings", () => {
    expect(getResponseHandlerModel(runtimeWith({ BITROUTER_RESPONSE_HANDLER_MODEL: "rh" }))).toBe("rh");
    expect(getActionPlannerModel(runtimeWith({ BITROUTER_ACTION_PLANNER_MODEL: "ap" }))).toBe("ap");
  });
});
