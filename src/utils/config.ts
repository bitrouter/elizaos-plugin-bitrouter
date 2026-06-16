import type { IAgentRuntime } from "@elizaos/core";

export const DEFAULT_BASE_URL = "http://127.0.0.1:4356";
export const DEFAULT_SMALL_MODEL = "gpt-4o-mini";
export const DEFAULT_LARGE_MODEL = "gpt-4o";

function getEnvValue(key: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  const value = process.env[key];
  return value === undefined ? undefined : String(value);
}

export function getSetting(
  runtime: IAgentRuntime,
  key: string,
  defaultValue?: string,
): string | undefined {
  const value = runtime.getSetting(key);
  if (value !== undefined && value !== null) return String(value);
  return getEnvValue(key) ?? defaultValue;
}

export function getBaseURL(runtime: IAgentRuntime): string {
  return getSetting(runtime, "BITROUTER_BASE_URL", DEFAULT_BASE_URL) ?? DEFAULT_BASE_URL;
}

export function getApiKey(runtime: IAgentRuntime): string | undefined {
  return getSetting(runtime, "BITROUTER_API_KEY");
}

export function getSmallModel(runtime: IAgentRuntime): string {
  return getSetting(runtime, "BITROUTER_SMALL_MODEL", DEFAULT_SMALL_MODEL) ?? DEFAULT_SMALL_MODEL;
}

export function getLargeModel(runtime: IAgentRuntime): string {
  return getSetting(runtime, "BITROUTER_LARGE_MODEL", DEFAULT_LARGE_MODEL) ?? DEFAULT_LARGE_MODEL;
}

export function getNanoModel(runtime: IAgentRuntime): string {
  return getSetting(runtime, "BITROUTER_NANO_MODEL") ?? getSmallModel(runtime);
}

export function getMediumModel(runtime: IAgentRuntime): string {
  return getSetting(runtime, "BITROUTER_MEDIUM_MODEL") ?? getSmallModel(runtime);
}

export function getMegaModel(runtime: IAgentRuntime): string {
  return getSetting(runtime, "BITROUTER_MEGA_MODEL") ?? getLargeModel(runtime);
}

export function getResponseHandlerModel(runtime: IAgentRuntime): string {
  return getSetting(runtime, "BITROUTER_RESPONSE_HANDLER_MODEL") ?? getLargeModel(runtime);
}

export function getActionPlannerModel(runtime: IAgentRuntime): string {
  return getSetting(runtime, "BITROUTER_ACTION_PLANNER_MODEL") ?? getLargeModel(runtime);
}

export function getObjectModel(runtime: IAgentRuntime): string {
  return getSetting(runtime, "BITROUTER_OBJECT_MODEL") ?? getLargeModel(runtime);
}
