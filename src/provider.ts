import type { IAgentRuntime } from "@elizaos/core";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { getApiKey, getBaseURL, getStructuredOutputs } from "./utils/config";

export function createBitRouterProvider(runtime: IAgentRuntime) {
  const base = getBaseURL(runtime).replace(/\/+$/, "");
  return createOpenAICompatible({
    name: "bitrouter",
    baseURL: `${base}/v1`,
    apiKey: getApiKey(runtime) ?? "bitrouter-local",
    supportsStructuredOutputs: getStructuredOutputs(runtime),
  });
}
