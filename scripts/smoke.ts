/**
 * Local smoke test: drives the built plugin's real model handlers against a
 * running BitRouter (default http://127.0.0.1:4356, no auth needed on localhost).
 *
 * Usage:
 *   bun run build
 *   bun scripts/smoke.ts
 *
 * Override models via env if your BitRouter catalog differs, e.g.:
 *   BITROUTER_SMALL_MODEL=openai/gpt-4o-mini BITROUTER_LARGE_MODEL=openai/gpt-4o bun scripts/smoke.ts
 */
import { ModelType } from "@elizaos/core";
import bitrouterPlugin from "../dist/index.js";

// Config the stub runtime hands back via getSetting (env wins if set).
const settings: Record<string, string> = {
  BITROUTER_BASE_URL: process.env.BITROUTER_BASE_URL ?? "http://127.0.0.1:4356",
  BITROUTER_SMALL_MODEL: process.env.BITROUTER_SMALL_MODEL ?? "openai/gpt-4o-mini",
  BITROUTER_LARGE_MODEL: process.env.BITROUTER_LARGE_MODEL ?? "openai/gpt-4o-mini",
};
if (process.env.BITROUTER_API_KEY) settings.BITROUTER_API_KEY = process.env.BITROUTER_API_KEY;

// Minimal IAgentRuntime stub: only the bits the handlers actually touch.
const runtime = {
  getSetting: (key: string) => settings[key],
  emitEvent: (type: unknown, payload: any) => {
    console.log(`  · event ${String(type)} tokens=${JSON.stringify(payload?.tokens)} model=${payload?.model}`);
  },
} as any;

const models = bitrouterPlugin.models ?? {};

async function run() {
  console.log(`BitRouter: ${settings.BITROUTER_BASE_URL}`);
  console.log(`small=${settings.BITROUTER_SMALL_MODEL}  large=${settings.BITROUTER_LARGE_MODEL}\n`);

  // 1) Plain text via TEXT_SMALL
  console.log("[1] TEXT_SMALL (plain text)");
  const text = await models[ModelType.TEXT_SMALL](runtime, {
    prompt: "Reply with exactly: pong",
    maxTokens: 512,
  });
  console.log(`  → ${JSON.stringify(text)}\n`);

  // 2) Structured output via TEXT_LARGE + responseSchema
  console.log("[2] TEXT_LARGE (structured output via responseSchema)");
  const obj = await models[ModelType.TEXT_LARGE](runtime, {
    prompt: "Return a JSON greeting object with a 'message' field.",
    maxTokens: 64,
    responseSchema: {
      type: "object",
      properties: { message: { type: "string" } },
      required: ["message"],
      // `additionalProperties: false` is required by OpenAI strict structured-output
      // mode (BITROUTER_STRUCTURED_OUTPUTS=true); harmless in the default json_object mode.
      additionalProperties: false,
    },
  });
  console.log(`  → ${typeof obj === "string" ? obj : JSON.stringify(obj)}`);
  // It should be a JSON string parseable into { message: ... }
  const parsed = JSON.parse(obj as string);
  console.log(`  parsed.message = ${JSON.stringify(parsed.message)}\n`);

  console.log("✓ smoke test passed");
}

run().catch((err) => {
  console.error("✗ smoke test failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
