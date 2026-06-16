import type { GenerateTextParams, IAgentRuntime, ModelTypeName, Plugin } from "@elizaos/core";
import { ModelType } from "@elizaos/core";
import { initializeBitRouter } from "./init";
import {
  handleActionPlanner,
  handleResponseHandler,
  handleTextLarge,
  handleTextMedium,
  handleTextMega,
  handleTextNano,
  handleTextSmall,
} from "./models/text";

const env = (key: string): string | null => process.env[key] ?? null;

export const bitrouterPlugin: Plugin = {
  name: "bitrouter",
  description: "BitRouter LLM routing plugin for ElizaOS",
  priority: Number(env("BITROUTER_PRIORITY") ?? 0),
  autoEnable: {
    envKeys: ["BITROUTER_API_KEY"],
  },
  config: {
    BITROUTER_BASE_URL: env("BITROUTER_BASE_URL"),
    BITROUTER_API_KEY: env("BITROUTER_API_KEY"),
    BITROUTER_NANO_MODEL: env("BITROUTER_NANO_MODEL"),
    BITROUTER_SMALL_MODEL: env("BITROUTER_SMALL_MODEL"),
    BITROUTER_MEDIUM_MODEL: env("BITROUTER_MEDIUM_MODEL"),
    BITROUTER_LARGE_MODEL: env("BITROUTER_LARGE_MODEL"),
    BITROUTER_MEGA_MODEL: env("BITROUTER_MEGA_MODEL"),
    BITROUTER_RESPONSE_HANDLER_MODEL: env("BITROUTER_RESPONSE_HANDLER_MODEL"),
    BITROUTER_ACTION_PLANNER_MODEL: env("BITROUTER_ACTION_PLANNER_MODEL"),
  },
  init: async (config: Record<string, string>, runtime: IAgentRuntime) => {
    await initializeBitRouter(config, runtime);
  },
  models: {
    [ModelType.TEXT_NANO]: (r: IAgentRuntime, p: GenerateTextParams) =>
      handleTextNano(r, p, ModelType.TEXT_NANO as ModelTypeName),
    [ModelType.TEXT_SMALL]: (r: IAgentRuntime, p: GenerateTextParams) =>
      handleTextSmall(r, p, ModelType.TEXT_SMALL as ModelTypeName),
    [ModelType.TEXT_MEDIUM]: (r: IAgentRuntime, p: GenerateTextParams) =>
      handleTextMedium(r, p, ModelType.TEXT_MEDIUM as ModelTypeName),
    [ModelType.TEXT_LARGE]: (r: IAgentRuntime, p: GenerateTextParams) =>
      handleTextLarge(r, p, ModelType.TEXT_LARGE as ModelTypeName),
    [ModelType.TEXT_MEGA]: (r: IAgentRuntime, p: GenerateTextParams) =>
      handleTextMega(r, p, ModelType.TEXT_MEGA as ModelTypeName),
    [ModelType.RESPONSE_HANDLER]: (r: IAgentRuntime, p: GenerateTextParams) =>
      handleResponseHandler(r, p, ModelType.RESPONSE_HANDLER as ModelTypeName),
    [ModelType.ACTION_PLANNER]: (r: IAgentRuntime, p: GenerateTextParams) =>
      handleActionPlanner(r, p, ModelType.ACTION_PLANNER as ModelTypeName),
  },
  tests: [
    {
      name: "bitrouter_plugin_tests",
      tests: [
        {
          name: "bitrouter_text_small",
          fn: async (runtime: IAgentRuntime) => {
            const result = await runtime.useModel(ModelType.TEXT_SMALL, {
              prompt: "Say hello",
            });
            if (!result || typeof result !== "string" || result.length === 0) {
              throw new Error("Expected non-empty string response");
            }
          },
        },
        {
          name: "bitrouter_structured_large",
          fn: async (runtime: IAgentRuntime) => {
            const result = await runtime.useModel(ModelType.TEXT_LARGE, {
              prompt: "Return a greeting object",
              responseSchema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                },
                required: ["message"],
              },
            });
            if (!result) {
              throw new Error("Expected truthy result");
            }
          },
        },
      ],
    },
  ],
};

export default bitrouterPlugin;
