// Spike — measure drawProjection cost and inspect output for the gearbox
// (the heaviest hero) and the NEMA mount (a simple one).
//
// Usage:  pnpm --filter web check-projection
import { initReplicad } from "../lib/replicad";
import { projectPart } from "../lib/dossier/projections";
import { assembleHero, getHero } from "../lib/replicad/heroes";

async function main(): Promise<void> {
  await initReplicad();

  for (const id of ["nema-mount", "gearbox"] as const) {
    const definition = getHero(id);
    if (!definition) continue;
    const model = definition.build(definition.defaultParams);
    const { compound } = assembleHero(model);

    const started = Date.now();
    const views = projectPart(compound);
    const elapsed = Date.now() - started;

    const summary = views
      .map((v) => `${v.label}: ${v.visiblePaths.length}v/${v.hiddenPaths.length}h`)
      .join(", ");
    console.log(`[projection] ${id}: ${elapsed} ms — ${summary}`);
    console.log(`  ${id} front viewBox: ${views[0].viewBox}`);
    console.log(`  ${id} sample path: ${views[0].visiblePaths[0]?.slice(0, 80)}`);
  }
}

main().catch((err: unknown) => {
  console.error("[projection] failed:", err);
  process.exit(1);
});
