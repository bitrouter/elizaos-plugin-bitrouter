# elizaos-plugin-bitrouter

An [elizaOS](https://elizaos.ai) LLM provider plugin that routes an agent's model
calls through a running [BitRouter](https://bitrouter.ai) instance via its
OpenAI-compatible endpoint. BitRouter handles upstream routing, cascading, and
load-balancing across providers.

> Targets `@elizaos/core@^1.7`. Pure model provider: no actions, providers,
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
| `BITROUTER_SMALL_MODEL` | `gpt-4o-mini` | model string for the SMALL tier (bare name → BitRouter auto-cascade, or `provider:model` to pin) |
| `BITROUTER_LARGE_MODEL` | `gpt-4o` | model string for the LARGE tier |
| `BITROUTER_OBJECT_MODEL` | → LARGE | model used for structured-output (OBJECT) generation |
| `BITROUTER_PRIORITY` | `0` | raise to make BitRouter outrank other registered model providers |

## Usage

```ts
import bitrouterPlugin from "elizaos-plugin-bitrouter";

export const character = {
  name: "Agent",
  plugins: [bitrouterPlugin],
};
```

## Supported model types

`TEXT_SMALL`, `TEXT_LARGE`, `OBJECT_SMALL`, `OBJECT_LARGE`.

Embeddings, vision, image generation, transcription, and TTS are **not** provided
— BitRouter is completions-only. Pair a separate embeddings plugin if your agent
needs RAG/memory embeddings.

## Development

```bash
bun install
bun test         # unit tests (vitest)
bun run typecheck
bun run build    # emits dist/
```

## License

MIT
