# elizaos-plugin-bitrouter

An [elizaOS](https://elizaos.ai) LLM provider plugin that routes an agent's model
calls through a running [BitRouter](https://bitrouter.ai) instance via its
OpenAI-compatible endpoint. BitRouter handles upstream routing, cascading, and
load-balancing across providers.

> Targets `@elizaos/core@^2.0`. Pure model provider: no actions, providers,
> services, or routes.

## Install

```bash
bun add elizaos-plugin-bitrouter
# or: npm install elizaos-plugin-bitrouter
```

## Configure

| Env var | Default | Notes |
| --- | --- | --- |
| `BITROUTER_BASE_URL` | `http://127.0.0.1:4356` | BitRouter listen address |
| `BITROUTER_API_KEY` | _(none)_ | `brvk_...` virtual key; optional when BitRouter runs with `skip_auth` on localhost |
| `BITROUTER_SMALL_MODEL` | `gpt-4o-mini` | SMALL tier model (bare name → BitRouter auto-cascade, or `provider:model` to pin) |
| `BITROUTER_LARGE_MODEL` | `gpt-4o` | LARGE tier model |
| `BITROUTER_NANO_MODEL` | → SMALL | NANO tier |
| `BITROUTER_MEDIUM_MODEL` | → SMALL | MEDIUM tier |
| `BITROUTER_MEGA_MODEL` | → LARGE | MEGA tier |
| `BITROUTER_RESPONSE_HANDLER_MODEL` | → LARGE | RESPONSE_HANDLER tier |
| `BITROUTER_ACTION_PLANNER_MODEL` | → LARGE | ACTION_PLANNER tier |
| `BITROUTER_PRIORITY` | `0` | raise to make BitRouter outrank other registered model providers |
| `BITROUTER_STRUCTURED_OUTPUTS` | `false` | `true`/`1`/`yes` advertises strict `json_schema` structured output. Off by default for compatibility across mixed upstreams; enable only when your routed models support it. Strict mode requires `responseSchema` objects to set `additionalProperties: false` (and list all keys in `required`) |

> **Auto-enable:** the plugin auto-enables when either `BITROUTER_API_KEY` **or**
> `BITROUTER_BASE_URL` is set — so a localhost `skip_auth` setup (no key) just needs
> `BITROUTER_BASE_URL`.

## Usage

```ts
import bitrouterPlugin from "elizaos-plugin-bitrouter";

export const character = {
  name: "Agent",
  plugins: [bitrouterPlugin],
};
```

With `autoEnable`, the plugin activates automatically when `BITROUTER_API_KEY` is set.

## Supported model types

Text generation: `TEXT_NANO`, `TEXT_SMALL`, `TEXT_MEDIUM`, `TEXT_LARGE`, `TEXT_MEGA`,
`RESPONSE_HANDLER`, `ACTION_PLANNER`.

**Structured output** is produced through these same text models: when a call includes
a `responseSchema`, the handler uses the model's structured-generation path and returns
a JSON string. (elizaOS 2.0 removed the standalone `OBJECT_*` model types.)

Embeddings, vision, image generation, transcription, and TTS are **not** provided —
BitRouter is completions-only. Pair a separate embeddings plugin for RAG/memory.

## Development

```bash
bun install
bun test         # unit tests (vitest)
bun run typecheck
bun run build    # emits dist/
```

## License

MIT
