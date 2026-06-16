import type {
  GenerateTextParams,
  IAgentRuntime,
  ObjectGenerationParams,
  Plugin,
} from "@elizaos/core";
import { ModelType } from "@elizaos/core";

import { initializeBitRouter } from "./init";
import { handleObjectLarge, handleObjectSmall } from "./models/object";
import {
  handleTextLarge,
  handleTextSmall,
} from "./models/text";

const env = (key: string): string | null =>
  typeof process !== "undefined" && process.env ? (process.env[key] ?? null) : null;

export const bitrouterPlugin: Plugin = {
  name: "bitrouter",
  description: "Routes elizaOS model calls through a BitRouter instance.",
  priority: Number(env("BITROUTER_PRIORITY") ?? 0),
  config: {
    BITROUTER_BASE_URL: env("BITROUTER_BASE_URL"),
    BITROUTER_API_KEY: env("BITROUTER_API_KEY"),
    BITROUTER_SMALL_MODEL: env("BITROUTER_SMALL_MODEL"),
    BITROUTER_LARGE_MODEL: env("BITROUTER_LARGE_MODEL"),
    BITROUTER_OBJECT_MODEL: env("BITROUTER_OBJECT_MODEL"),
  },
  async init(config: Record<string, string>, runtime: IAgentRuntime) {
    await initializeBitRouter(config, runtime);
  },
  models: {
    [ModelType.TEXT_SMALL]: (r: IAgentRuntime, p: GenerateTextParams) =>
      handleTextSmall(r, p, ModelType.TEXT_SMALL),
    [ModelType.TEXT_LARGE]: (r: IAgentRuntime, p: GenerateTextParams) =>
      handleTextLarge(r, p, ModelType.TEXT_LARGE),
    [ModelType.OBJECT_SMALL]: async (r: IAgentRuntime, p: ObjectGenerationParams) =>
      handleObjectSmall(r, p, ModelType.OBJECT_SMALL) as Promise<Record<string, unknown>>,
    [ModelType.OBJECT_LARGE]: async (r: IAgentRuntime, p: ObjectGenerationParams) =>
      handleObjectLarge(r, p, ModelType.OBJECT_LARGE) as Promise<Record<string, unknown>>,
  },
  tests: [
    {
      name: "bitrouter_plugin_tests",
      tests: [
        {
          name: "bitrouter_text_small",
          fn: async (runtime: IAgentRuntime) => {
            const text = await runtime.useModel(ModelType.TEXT_SMALL, {
              prompt: "What is the nature of reality in 10 words?",
            });
            if (!text || (text as string).length === 0) {
              throw new Error("Failed to generate text");
            }
          },
        },
        {
          name: "bitrouter_object_large",
          fn: async (runtime: IAgentRuntime) => {
            const obj = await runtime.useModel(ModelType.OBJECT_LARGE, {
              prompt: "Return a JSON object with a message field that says hello.",
              schema: {
                type: "object",
                properties: { message: { type: "string" } },
                required: ["message"],
              },
            });
            if (!obj) {
              throw new Error("Failed to generate object");
            }
          },
        },
      ],
    },
  ],
};

export default bitrouterPlugin;
