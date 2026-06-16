import { type IAgentRuntime, logger } from "@elizaos/core";
import { getApiKey, getBaseURL } from "./utils/config";

export async function initializeBitRouter(
  _config: Record<string, unknown>,
  runtime: IAgentRuntime,
): Promise<void> {
  try {
    const apiKey = getApiKey(runtime);
    if (!apiKey) {
      logger.warn(
        "BITROUTER_API_KEY is not set - assuming BitRouter runs with skip_auth on localhost",
      );
      return;
    }
    const base = getBaseURL(runtime).replace(/\/+$/, "");
    const response = await fetch(`${base}/v1/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) {
      logger.warn(`BitRouter API key validation failed: ${response.statusText}`);
    } else {
      logger.log("BitRouter API key validated successfully");
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`Error validating BitRouter connection: ${message}`);
  }
}
