// Headless check — confirm Replicad imports a CadQuery-generated STEP file by
// running the real Layer 2 web path: loadArchetype (importSTEP -> bounds).
//
// All imports come through ../lib/replicad/* so they share one Replicad
// module instance (the Next.js bundle dedupes this automatically).
//
// Usage:  pnpm --filter web check-import <path-to-step-file>
import { readFileSync } from "node:fs";

import { initReplicad } from "../lib/replicad";
import { loadArchetype } from "../lib/replicad/heroes";

async function main(): Promise<void> {
  const path = process.argv[2];
  if (!path) {
    throw new Error("usage: pnpm --filter web check-import <path-to-step-file>");
  }

  await initReplicad();

  const response = {
    step_b64: readFileSync(path).toString("base64"),
    metadata: {
      archetype: "check",
      label: "Check",
      semantic_tree: { name: "check", children: [] },
      sliders: [],
      bounding_box: [0, 0, 0] as [number, number, number],
    },
  };

  const loaded = await loadArchetype(response);
  const [x, y, z] = loaded.bounds.size;
  console.log(`[import] OK — bounds ${x.toFixed(1)} x ${y.toFixed(1)} x ${z.toFixed(1)} mm`);
}

main().catch((err: unknown) => {
  console.error("[import] failed:", err);
  process.exit(1);
});
