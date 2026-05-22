"use client";

// Phase 1 playground — the full code → Replicad → viewport → STEP/STL
// round-trip on one page. Loaded only on the client because it depends on
// the OpenCascade WASM bundle.
import { useEffect, useRef, useState } from "react";

import { ReplicadShape } from "@/components/ReplicadShape";
import { Viewport } from "@/components/Viewport";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { useReplicad, type BracketBuild } from "@/lib/hooks/useReplicad";
import {
  BRACKET_PARAM_DEFS,
  DEFAULT_BRACKET_PARAMS,
  downloadBlob,
  exportSTEP,
  exportSTL,
  type BracketParams,
} from "@/lib/replicad";

export default function PlaygroundClient() {
  const { status, buildPart } = useReplicad();
  const [params, setParams] = useState<BracketParams>(DEFAULT_BRACKET_PARAMS);
  const [build, setBuild] = useState<BracketBuild | null>(null);

  // Hold the previous shape so its OpenCascade memory can be freed once a
  // newer build has replaced it.
  const previousShape = useRef<BracketBuild["shape"] | null>(null);

  useEffect(() => {
    if (status !== "ready") return;
    try {
      const next = buildPart(params);
      setBuild(next);

      const stale = previousShape.current;
      previousShape.current = next.shape;
      if (stale) {
        try {
          stale.delete();
        } catch {
          // Shape was already released — nothing to do.
        }
      }
    } catch (err) {
      console.error("Bracket build failed:", err);
    }
  }, [status, params, buildPart]);

  const updateParam = (key: keyof BracketParams, value: number): void => {
    setParams((current) => ({ ...current, [key]: value }));
  };

  const handleExport = (kind: "step" | "stl"): void => {
    if (!build) return;
    try {
      const blob = kind === "step" ? exportSTEP(build.shape) : exportSTL(build.shape);
      downloadBlob(blob, `katacad-bracket.${kind}`);
    } catch (err) {
      console.error(`${kind.toUpperCase()} export failed:`, err);
    }
  };

  return (
    <main className="flex h-screen flex-col bg-surface text-ink">
      <header className="flex items-center gap-3 border-b border-line px-5 py-3">
        <Wordmark />
        <span className="font-mono text-2xs uppercase tracking-[0.18em] text-ink-muted">
          · Phase 1 Playground
        </span>
        <span className="ml-auto font-mono text-2xs uppercase tracking-wider text-ink-faint">
          Kernel · {status}
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 overflow-y-auto border-r border-line bg-surface p-4">
          {status === "loading" ? (
            <p className="text-2xs text-ink-muted">Loading the CAD kernel (WASM)…</p>
          ) : null}
          {status === "error" ? (
            <p className="text-2xs text-ink-muted">
              Failed to load the CAD kernel. See the browser console.
            </p>
          ) : null}

          <p className="mb-3 font-mono text-2xs uppercase tracking-[0.14em] text-ink-faint">
            Parameters · {String(BRACKET_PARAM_DEFS.length).padStart(2, "0")}
          </p>
          <div className="flex flex-col gap-3.5">
            {BRACKET_PARAM_DEFS.map((def) => (
              <label key={def.key} className="flex flex-col gap-1.5">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-2xs text-ink-soft">{def.label}</span>
                  <span className="font-mono text-2xs text-ink">{params[def.key]}</span>
                </span>
                <input
                  type="range"
                  min={def.min}
                  max={def.max}
                  step={def.step}
                  value={params[def.key]}
                  disabled={status !== "ready"}
                  onChange={(event) => updateParam(def.key, Number(event.target.value))}
                />
              </label>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Button onClick={() => handleExport("step")} disabled={!build}>
              Export STEP
            </Button>
            <Button onClick={() => handleExport("stl")} disabled={!build}>
              Export STL
            </Button>
          </div>
        </aside>

        <section className="flex-1">
          <Viewport cameraPosition={[130, 100, 130]}>
            {build ? <ReplicadShape mesh={build.mesh} /> : null}
          </Viewport>
        </section>
      </div>
    </main>
  );
}
