"use client";

// Phase 1 playground — the full code → Replicad → viewport → STEP/STL
// round-trip on one page. Loaded only on the client (see page.tsx) because
// it depends on the OpenCascade WASM bundle.
import { useEffect, useRef, useState } from "react";

import { Viewport } from "@/components/Viewport";
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

  // Holds the previously built shape so its OpenCascade memory can be freed
  // once a newer build has replaced it.
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

  const updateParam = (key: keyof BracketParams, value: number) => {
    setParams((current) => ({ ...current, [key]: value }));
  };

  const handleExport = (kind: "step" | "stl") => {
    if (!build) return;
    try {
      const blob = kind === "step" ? exportSTEP(build.shape) : exportSTL(build.shape);
      downloadBlob(blob, `katacad-bracket.${kind}`);
    } catch (err) {
      console.error(`${kind.toUpperCase()} export failed:`, err);
    }
  };

  return (
    <main className="flex h-screen flex-col">
      <header className="border-b p-4">
        <h1>KatACAD — Phase 1 Playground</h1>
        <p>A real parametric L-bracket: Replicad B-Rep, rendered in Three.js, exported as STEP/STL.</p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 overflow-y-auto border-r p-4">
          <p>Kernel status: {status}</p>
          {status === "loading" && <p>Loading the CAD kernel (WASM)...</p>}
          {status === "error" && <p>Failed to load the CAD kernel. See the browser console.</p>}

          <div className="mt-4 flex flex-col gap-4">
            {BRACKET_PARAM_DEFS.map((def) => (
              <label key={def.key} className="flex flex-col">
                <span>
                  {def.label}: {params[def.key]}
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
            <button type="button" onClick={() => handleExport("step")} disabled={!build}>
              Export STEP
            </button>
            <button type="button" onClick={() => handleExport("stl")} disabled={!build}>
              Export STL
            </button>
          </div>
        </aside>

        <section className="flex-1">
          <Viewport mesh={build?.mesh ?? null} />
        </section>
      </div>
    </main>
  );
}
