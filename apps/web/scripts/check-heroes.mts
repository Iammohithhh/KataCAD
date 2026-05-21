// Headless geometry check for the Layer 1 heroes.
//
// Builds and assembles every available hero, then exports each to STEP. This
// verifies the Replicad geometry (gears, cuts, fuses, the assembly compound)
// without needing a browser — run it after changing hero geometry.
//
// Run with:  pnpm --filter web heroes
import { assembleHero, getHero, HERO_GALLERY } from "../lib/replicad/heroes";
import { initReplicad } from "../lib/replicad/oc";

async function main(): Promise<void> {
  await initReplicad();

  for (const entry of HERO_GALLERY) {
    if (!entry.available) {
      console.log(`[heroes] ${entry.id}: placeholder — skipped`);
      continue;
    }

    const definition = getHero(entry.id);
    if (!definition) {
      throw new Error(`No definition registered for available hero "${entry.id}"`);
    }

    const model = definition.build(definition.defaultParams);
    const { compound, bounds } = assembleHero(model);
    const bytes = Buffer.from(await compound.blobSTEP().arrayBuffer());

    const size = bounds.size.map((n) => n.toFixed(0)).join(" x ");
    console.log(`[heroes] ${entry.id}: STEP ${bytes.length} bytes, bounds ${size} mm`);
  }

  console.log("[heroes] all heroes built and exported successfully");
}

main().catch((err: unknown) => {
  console.error("[heroes] failed:", err);
  process.exit(1);
});
