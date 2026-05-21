// Headless STEP fixture generator.
//
// Builds the default L-bracket with the same `buildBracket` code the browser
// uses and writes it to fixtures/bracket-default.step. Committing this file
// gives later phases a regression baseline, and running this script verifies
// the geometry + STEP pipeline without needing a browser.
//
// Run with:  pnpm --filter web fixture
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildBracket, DEFAULT_BRACKET_PARAMS } from "../lib/replicad/bracket";
import { initReplicad } from "../lib/replicad/oc";

async function main(): Promise<void> {
  await initReplicad();

  const bracket = buildBracket(DEFAULT_BRACKET_PARAMS);
  const stepBlob = bracket.blobSTEP();
  const bytes = Buffer.from(await stepBlob.arrayBuffer());

  const here = dirname(fileURLToPath(import.meta.url));
  const outPath = join(here, "..", "fixtures", "bracket-default.step");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, bytes);

  console.log(`[fixture] wrote ${bytes.length} bytes -> ${outPath}`);
}

main().catch((err: unknown) => {
  console.error("[fixture] failed:", err);
  process.exit(1);
});
