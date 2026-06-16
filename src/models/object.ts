import type { IAgentRuntime, ModelTypeName, ObjectGenerationParams } from "@elizaos/core";
import type { JSONSchema7 } from "@ai-sdk/provider";
import { generateObject, jsonSchema } from "ai";
import { createBitRouterProvider } from "../provider";
import { getLargeModel, getObjectModel, getSmallModel } from "../utils/config";
import { emitModelUsageEvent } from "../utils/events";

export async function handleObject(
  runtime: IAgentRuntime,
  params: ObjectGenerationParams,
  modelType: ModelTypeName,
  modelName?: string,
): Promise<unknown> {
  const provider = createBitRouterProvider(runtime);
  const resolved = modelName ?? getObjectModel(runtime);
  const result = await generateObject({
    model: provider.chatModel(resolved),
    prompt: params.prompt,
    schema: jsonSchema<unknown>(params.schema as unknown as JSONSchema7),
    ...(params.temperature !== undefined ? { temperature: params.temperature } : {}),
  });

  emitModelUsageEvent(runtime, modelType, params.prompt ?? "", result.usage ?? {}, resolved);
  return result.object;
}

export const handleObjectSmall = (r: IAgentRuntime, p: ObjectGenerationParams, t: ModelTypeName) =>
  handleObject(r, p, t, getSmallModel(r));
export const handleObjectLarge = (r: IAgentRuntime, p: ObjectGenerationParams, t: ModelTypeName) =>
  handleObject(r, p, t, getLargeModel(r));
