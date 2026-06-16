import { $ } from "bun";

await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "node",
  format: "esm",
  external: ["@elizaos/core", "ai", "@ai-sdk/openai-compatible"],
});

await $`tsc --emitDeclarationOnly --declaration --outDir dist -p tsconfig.json`;
