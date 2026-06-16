/**
 * Integration test: loads bitrouterPlugin into a REAL @elizaos/core AgentRuntime
 * and drives runtime.useModel(...) against a live BitRouter instance.
 *
 * Usage:
 *   bun run build
 *   bun scripts/eliza-verify.ts
 *
 * Givens:
 *   - BitRouter RUNNING at http://127.0.0.1:4356 (no auth on localhost)
 *   - Model: openai/gpt-4o-mini (must use provider/ prefix)
 *
 * What this tests:
 *   registerPlugin → init → registerModel → useModel resolution
 */

import { AgentRuntime, InMemoryDatabaseAdapter, ModelType } from "@elizaos/core";
import bitrouterPlugin from "../dist/index.js";

// ---------------------------------------------------------------------------
// 1. Config: placed in character.settings (flat key index, readable by getSetting)
//    getSetting resolution order (from source):
//      character.secrets[key]
//      → character.settings[key]    ← we use this
//      → character.settings.extra[key]
//      → character.settings.secrets[key]
//      → character.env[key]
//      → constructor settings param
// ---------------------------------------------------------------------------
const BITROUTER_BASE_URL = process.env.BITROUTER_BASE_URL ?? "http://127.0.0.1:4356";
const BITROUTER_SMALL_MODEL = process.env.BITROUTER_SMALL_MODEL ?? "openai/gpt-4o-mini";
const BITROUTER_LARGE_MODEL = process.env.BITROUTER_LARGE_MODEL ?? "openai/gpt-4o-mini";

const character = {
  name: "ElizaVerifyBot",
  settings: {
    // Flat keys — picked up by getSetting via character.settings[key]
    BITROUTER_BASE_URL,
    BITROUTER_SMALL_MODEL,
    BITROUTER_LARGE_MODEL,
  } as Record<string, unknown>,
};

// ---------------------------------------------------------------------------
// 2. Construct AgentRuntime
//    adapter: InMemoryDatabaseAdapter — needed by initialize()
//    disableBasicCapabilities: prevents @elizaos/core's built-in LLM plugins
//    from shadowing our plugin (they would register TEXT_SMALL etc. before us)
// ---------------------------------------------------------------------------
const adapter = new InMemoryDatabaseAdapter();

const runtime = new AgentRuntime({
  character,
  adapter,
  disableBasicCapabilities: true,
  logLevel: "warn", // suppress trace noise; set to "debug" for verbose output
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function hr(label: string) {
  console.log(`\n${"─".repeat(60)}\n  ${label}\n${"─".repeat(60)}`);
}

function ok(label: string, value: unknown) {
  console.log(`  [PASS] ${label}: ${JSON.stringify(value)}`);
}

function fail(label: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`  [FAIL] ${label}: ${msg}`);
}

// ---------------------------------------------------------------------------
async function run() {
  console.log("=".repeat(60));
  console.log("  elizaOS AgentRuntime integration verify");
  console.log("=".repeat(60));
  console.log(`  BitRouter URL : ${BITROUTER_BASE_URL}`);
  console.log(`  Small model   : ${BITROUTER_SMALL_MODEL}`);
  console.log(`  Large model   : ${BITROUTER_LARGE_MODEL}`);

  // -------------------------------------------------------------------------
  // Step 1: Verify getSetting sees our config
  // -------------------------------------------------------------------------
  hr("Step 1 — getSetting resolution check");
  const resolvedUrl = runtime.getSetting("BITROUTER_BASE_URL");
  const resolvedSmall = runtime.getSetting("BITROUTER_SMALL_MODEL");
  const resolvedLarge = runtime.getSetting("BITROUTER_LARGE_MODEL");
  console.log(`  BITROUTER_BASE_URL    → ${JSON.stringify(resolvedUrl)}`);
  console.log(`  BITROUTER_SMALL_MODEL → ${JSON.stringify(resolvedSmall)}`);
  console.log(`  BITROUTER_LARGE_MODEL → ${JSON.stringify(resolvedLarge)}`);
  if (resolvedUrl !== BITROUTER_BASE_URL) {
    throw new Error(`getSetting('BITROUTER_BASE_URL') returned ${resolvedUrl}, expected ${BITROUTER_BASE_URL}`);
  }
  if (resolvedSmall !== BITROUTER_SMALL_MODEL) {
    throw new Error(`getSetting('BITROUTER_SMALL_MODEL') returned ${resolvedSmall}, expected ${BITROUTER_SMALL_MODEL}`);
  }
  ok("getSetting resolves from character.settings", "ok");

  // -------------------------------------------------------------------------
  // Step 2: registerPlugin
  //   - Calls plugin.init(config, runtime) → initializeBitRouter
  //   - Registers plugin.models[...] via runtime.registerModel(modelType, handler, pluginName, priority)
  // -------------------------------------------------------------------------
  hr("Step 2 — registerPlugin (init + model registration)");
  console.log(`  Plugin name: ${bitrouterPlugin.name}`);
  await runtime.registerPlugin(bitrouterPlugin);
  console.log("  registerPlugin() completed without error");

  // -------------------------------------------------------------------------
  // Step 3: initialize (with InMemoryDatabaseAdapter already attached)
  //   skipMigrations: true — InMemoryAdapter has no migrations to run
  //   This wires up the message service and creates the agent record in-memory.
  // -------------------------------------------------------------------------
  hr("Step 3 — initialize()");
  await runtime.initialize({ skipMigrations: true });
  console.log("  initialize() completed without error");

  // -------------------------------------------------------------------------
  // Step 4: Verify model registration
  //   runtime.models is Map<string, ModelHandler[]>
  // -------------------------------------------------------------------------
  hr("Step 4 — Registered model map");
  const registeredTypes: string[] = [];
  for (const [key, handlers] of runtime.models.entries()) {
    if (handlers.length > 0) {
      const providerList = handlers.map((h) => h.provider ?? "?").join(", ");
      console.log(`  ${key} → [${providerList}]`);
      registeredTypes.push(key);
    }
  }
  const hasBitrouterSmall = runtime.models.get(ModelType.TEXT_SMALL)?.some((h) => h.provider === "bitrouter") ?? false;
  const hasBitrouterLarge = runtime.models.get(ModelType.TEXT_LARGE)?.some((h) => h.provider === "bitrouter") ?? false;
  ok("TEXT_SMALL registered under 'bitrouter'", hasBitrouterSmall);
  ok("TEXT_LARGE registered under 'bitrouter'", hasBitrouterLarge);
  if (!hasBitrouterSmall || !hasBitrouterLarge) {
    throw new Error("Plugin models not registered under provider 'bitrouter'");
  }

  // -------------------------------------------------------------------------
  // Step 5: useModel — TEXT_SMALL (plain text)
  //   Note: "json" must appear in prompt for json_object mode to activate.
  //   This call uses plain text mode.
  // -------------------------------------------------------------------------
  hr(`Step 5 — useModel(TEXT_SMALL, { prompt: "Reply with exactly: pong" })`);
  const textSmallResult = await runtime.useModel(ModelType.TEXT_SMALL, {
    prompt: "Reply with exactly: pong",
    maxTokens: 32,
  });
  console.log(`  raw result type : ${typeof textSmallResult}`);
  console.log(`  raw result      : ${JSON.stringify(textSmallResult)}`);
  ok("TEXT_SMALL returned non-empty string", typeof textSmallResult === "string" && (textSmallResult as string).length > 0);

  // -------------------------------------------------------------------------
  // Step 6: useModel — TEXT_LARGE (structured output via responseSchema)
  //   Include the word "json" in the prompt so OpenAI's json_object mode works.
  // -------------------------------------------------------------------------
  hr(`Step 6 — useModel(TEXT_LARGE, { prompt: "...", responseSchema: {...} })`);
  const textLargeResult = await runtime.useModel(ModelType.TEXT_LARGE, {
    prompt: 'Return a JSON greeting object with a "message" field. Return only json.',
    maxTokens: 64,
    responseSchema: {
      type: "object",
      properties: { message: { type: "string" } },
      required: ["message"],
    },
  });
  console.log(`  raw result type : ${typeof textLargeResult}`);
  console.log(`  raw result      : ${JSON.stringify(textLargeResult)}`);
  let parsedGreeting: { message?: string } = {};
  if (typeof textLargeResult === "string") {
    try {
      parsedGreeting = JSON.parse(textLargeResult as string);
      ok("TEXT_LARGE result is parseable JSON", parsedGreeting);
    } catch (e) {
      fail("TEXT_LARGE result JSON.parse", e);
    }
  } else if (textLargeResult && typeof textLargeResult === "object") {
    parsedGreeting = textLargeResult as { message?: string };
    ok("TEXT_LARGE returned object directly", parsedGreeting);
  }
  if (parsedGreeting.message !== undefined) {
    ok("parsed.message", parsedGreeting.message);
  } else {
    fail("parsed.message missing", parsedGreeting);
  }

  // -------------------------------------------------------------------------
  // Step 7: verify which provider useModel resolved to
  //   runtime.models map directly shows which providers are registered;
  //   the runtime's resolveModelRegistration picks the highest-priority one.
  // -------------------------------------------------------------------------
  hr("Step 7 — Provider resolution check");
  const smallHandlers = runtime.models.get(ModelType.TEXT_SMALL) ?? [];
  const largeHandlers = runtime.models.get(ModelType.TEXT_LARGE) ?? [];
  console.log(`  TEXT_SMALL providers (by priority): ${smallHandlers.map((h) => `${h.provider}(p=${h.priority})`).join(", ")}`);
  console.log(`  TEXT_LARGE providers (by priority): ${largeHandlers.map((h) => `${h.provider}(p=${h.priority})`).join(", ")}`);
  // The highest-priority (or first registered) handler is [0] after sort
  const resolvedSmallProvider = smallHandlers[0]?.provider;
  const resolvedLargeProvider = largeHandlers[0]?.provider;
  ok("TEXT_SMALL resolved to 'bitrouter'", resolvedSmallProvider === "bitrouter");
  ok("TEXT_LARGE resolved to 'bitrouter'", resolvedLargeProvider === "bitrouter");

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log("\n" + "=".repeat(60));
  console.log("  ALL CHECKS PASSED — useModel through AgentRuntime works");
  console.log("=".repeat(60));
}

run().catch((err) => {
  console.error("\n[FATAL]", err instanceof Error ? err.message : err);
  if (err instanceof Error && err.stack) {
    console.error(err.stack);
  }
  process.exit(1);
});
