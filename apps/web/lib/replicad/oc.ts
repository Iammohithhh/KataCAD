// OpenCascade WASM initialization for Replicad.
//
// Replicad needs an OpenCascade instance injected once, via `setOC`, before
// any geometry can be built. The WASM bundle is large, so we initialize it
// exactly once and share the in-flight promise across all callers.
import initOpenCascade from "replicad-opencascadejs/src/replicad_single.js";
import { setOC } from "replicad";

// The shipped type declares `init()` with no arguments, but the real
// Emscripten factory accepts module overrides (notably `locateFile`).
type OCFactory = (overrides?: {
  locateFile?: (path: string) => string;
}) => Promise<unknown>;

const opencascade = initOpenCascade as unknown as OCFactory;

// In the browser the WASM is served as a static asset (copied into
// public/wasm/ by scripts/copy-wasm.mjs). In Node — the headless fixture
// script — the Emscripten glue resolves it next to itself in node_modules,
// so no locateFile override is passed.
const BROWSER_WASM_URL = "/wasm/replicad_single.wasm";

let initPromise: Promise<void> | null = null;

/**
 * Initialize OpenCascade and register it with Replicad. Safe to call any
 * number of times — the work happens once and later calls await the same
 * promise. Resolves when `replicad` is ready to build geometry.
 */
export function initReplicad(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const isBrowser = typeof window !== "undefined";
    const oc = await opencascade(
      isBrowser ? { locateFile: () => BROWSER_WASM_URL } : undefined,
    );
    setOC(oc as Parameters<typeof setOC>[0]);
  })();

  return initPromise;
}
