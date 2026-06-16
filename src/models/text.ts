import type { GenerateTextParams, IAgentRuntime, ModelTypeName } from "@elizaos/core";
import { generateText } from "ai";
import { createBitRouterProvider } from "../provider";
import {
  getLargeModel,
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
  const result = await generateText({
    model: provider.chatModel(modelName),
    prompt: params.prompt,
    ...(params.temperature !== undefined ? { temperature: params.temperature } : {}),
    ...(params.maxTokens !== undefined ? { maxOutputTokens: params.maxTokens } : {}),
    ...(params.stopSequences ? { stopSequences: params.stopSequences } : {}),
    ...(params.frequencyPenalty !== undefined ? { frequencyPenalty: params.frequencyPenalty } : {}),
    ...(params.presencePenalty !== undefined ? { presencePenalty: params.presencePenalty } : {}),
  });

  emitModelUsageEvent(runtime, modelType, params.prompt ?? "", result.usage ?? {}, modelName);
  return result.text;
}

export const handleTextSmall = (r: IAgentRuntime, p: GenerateTextParams, t: ModelTypeName) =>
  handleText(r, p, t, getSmallModel(r));
export const handleTextLarge = (r: IAgentRuntime, p: GenerateTextParams, t: ModelTypeName) =>
  handleText(r, p, t, getLargeModel(r));
