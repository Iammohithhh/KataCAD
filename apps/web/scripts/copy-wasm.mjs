// Copies the OpenCascade WASM binary out of node_modules into public/wasm/
// so the browser can fetch it at runtime via Module.locateFile. Runs on
// `predev` and `prebuild`. The copied file is gitignored — it is a build
// artifact, always reproduced from the installed dependency.
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));

const src = require.resolve("replicad-opencascadejs/src/replicad_single.wasm");
const destDir = join(here, "..", "public", "wasm");
const dest = join(destDir, "replicad_single.wasm");

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);

console.log(`[copy-wasm] ${src} -> ${dest}`);
