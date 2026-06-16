import type { GenerateTextParams, IAgentRuntime, ModelTypeName } from "@elizaos/core";
import type { JSONSchema7 } from "@ai-sdk/provider";
import { generateObject, generateText, jsonSchema } from "ai";
import { createBitRouterProvider } from "../provider";
import {
  getActionPlannerModel,
  getLargeModel,
  getMediumModel,
  getMegaModel,
  getNanoModel,
  getResponseHandlerModel,
  getSmallModel,
} from "../utils/config";
import { emitModelUsageEvent } from "../utils/events";

export async function handleText(
  runtime: IAgentRuntime,
  params: GenerateTextParams,
  modelType: ModelTypeName,
  modelName: string,
): Promise<string> {
  const provider = createBitRouterProvider(runtime);
  const model = provider.chatModel(modelName);
  const prompt = params.prompt ?? "";

  if (params.responseSchema) {
    const result = await generateObject({
      model,
      prompt,
      schema: jsonSchema<unknown>(params.responseSchema as unknown as JSONSchema7),
      ...(params.system ? { system: params.system } : {}),
      ...(params.temperature !== undefined ? { temperature: params.temperature } : {}),
    });
    emitModelUsageEvent(runtime, modelType, prompt, result.usage ?? {}, modelName);
    return JSON.stringify(result.object);
  }

  const result = await generateText({
    model,
    prompt,
    ...(params.system !== undefined ? { system: params.system } : {}),
    ...(params.temperature !== undefined ? { temperature: params.temperature } : {}),
    ...(params.maxTokens !== undefined ? { maxOutputTokens: params.maxTokens } : {}),
    ...(params.topP !== undefined ? { topP: params.topP } : {}),
    ...(params.seed !== undefined ? { seed: params.seed } : {}),
    ...(params.stopSequences ? { stopSequences: params.stopSequences } : {}),
    ...(params.frequencyPenalty !== undefined ? { frequencyPenalty: params.frequencyPenalty } : {}),
    ...(params.presencePenalty !== undefined ? { presencePenalty: params.presencePenalty } : {}),
  });

  emitModelUsageEvent(runtime, modelType, prompt, result.usage ?? {}, modelName);
  return result.text;
}

export const handleTextNano = (r: IAgentRuntime, p: GenerateTextParams, t: ModelTypeName) =>
  handleText(r, p, t, getNanoModel(r));
export const handleTextSmall = (r: IAgentRuntime, p: GenerateTextParams, t: ModelTypeName) =>
  handleText(r, p, t, getSmallModel(r));
export const handleTextMedium = (r: IAgentRuntime, p: GenerateTextParams, t: ModelTypeName) =>
  handleText(r, p, t, getMediumModel(r));
export const handleTextLarge = (r: IAgentRuntime, p: GenerateTextParams, t: ModelTypeName) =>
  handleText(r, p, t, getLargeModel(r));
export const handleTextMega = (r: IAgentRuntime, p: GenerateTextParams, t: ModelTypeName) =>
  handleText(r, p, t, getMegaModel(r));
export const handleResponseHandler = (r: IAgentRuntime, p: GenerateTextParams, t: ModelTypeName) =>
  handleText(r, p, t, getResponseHandlerModel(r));
export const handleActionPlanner = (r: IAgentRuntime, p: GenerateTextParams, t: ModelTypeName) =>
  handleText(r, p, t, getActionPlannerModel(r));
