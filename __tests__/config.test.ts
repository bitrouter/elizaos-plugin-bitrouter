import { describe, expect, it } from "vitest";
import {
  DEFAULT_BASE_URL,
  getActionPlannerModel,
  getApiKey,
  getBaseURL,
  getLargeModel,
  getMediumModel,
  getMegaModel,
  getNanoModel,
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

  it("explicit large model wins", () => {
    expect(getLargeModel(runtimeWith({ BITROUTER_LARGE_MODEL: "L" }))).toBe("L");
  });

  it("nano model defaults to small model when env not set", () => {
    const rt = runtimeWith({ BITROUTER_SMALL_MODEL: "small-x" });
    expect(getNanoModel(rt)).toBe("small-x");
  });

  it("nano model returns explicit env value when set", () => {
    const rt = runtimeWith({ BITROUTER_NANO_MODEL: "nano-x" });
    expect(getNanoModel(rt)).toBe("nano-x");
  });

  it("medium model defaults to small model when env not set", () => {
    const rt = runtimeWith({ BITROUTER_SMALL_MODEL: "small-x" });
    expect(getMediumModel(rt)).toBe("small-x");
  });

  it("medium model returns explicit env value when set", () => {
    const rt = runtimeWith({ BITROUTER_MEDIUM_MODEL: "medium-x" });
    expect(getMediumModel(rt)).toBe("medium-x");
  });

  it("mega model defaults to large model when env not set", () => {
    const rt = runtimeWith({ BITROUTER_LARGE_MODEL: "large-x" });
    expect(getMegaModel(rt)).toBe("large-x");
  });

  it("mega model returns explicit env value when set", () => {
    const rt = runtimeWith({ BITROUTER_MEGA_MODEL: "mega-x" });
    expect(getMegaModel(rt)).toBe("mega-x");
  });

  it("response handler model defaults to large model when env not set", () => {
    const rt = runtimeWith({ BITROUTER_LARGE_MODEL: "large-x" });
    expect(getResponseHandlerModel(rt)).toBe("large-x");
  });

  it("response handler model returns explicit env value when set", () => {
    const rt = runtimeWith({ BITROUTER_RESPONSE_HANDLER_MODEL: "rh-x" });
    expect(getResponseHandlerModel(rt)).toBe("rh-x");
  });

  it("action planner model defaults to large model when env not set", () => {
    const rt = runtimeWith({ BITROUTER_LARGE_MODEL: "large-x" });
    expect(getActionPlannerModel(rt)).toBe("large-x");
  });

  it("action planner model returns explicit env value when set", () => {
    const rt = runtimeWith({ BITROUTER_ACTION_PLANNER_MODEL: "ap-x" });
    expect(getActionPlannerModel(rt)).toBe("ap-x");
  });
});
