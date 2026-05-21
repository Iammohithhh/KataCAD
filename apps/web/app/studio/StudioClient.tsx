"use client";

// Phase 2 studio — load any of the three Layer 1 heroes from the gallery,
// watch it animate, and export it as a STEP/STL assembly. Loaded client-side
// only (see page.tsx) because it depends on the OpenCascade WASM bundle.
import { useEffect, useState } from "react";

import type { HeroId } from "@katacad/shared";

import { HeroGallery } from "@/components/HeroGallery";
import { HeroScene } from "@/components/HeroScene";
import { Viewport } from "@/components/Viewport";
import { useReplicad } from "@/lib/hooks/useReplicad";
import { downloadBlob } from "@/lib/replicad";
import {
  assembleHero,
  getHero,
  type AssembledHero,
  type HeroBounds,
  type HeroDefinition,
  type HeroModel,
  type HeroParams,
} from "@/lib/replicad/heroes";

interface LoadedHero {
  id: HeroId;
  definition: HeroDefinition;
  model: HeroModel;
  bounds: HeroBounds;
  compound: AssembledHero["compound"];
  params: HeroParams;
}

export default function StudioClient() {
  const { status } = useReplicad();
  const [activeId, setActiveId] = useState<HeroId>("gearbox");
  const [hero, setHero] = useState<LoadedHero | null>(null);

  useEffect(() => {
    if (status !== "ready") return;

    const definition = getHero(activeId);
    if (!definition) {
      console.error(`No hero definition registered for "${activeId}".`);
      return;
    }

    try {
      const params = definition.defaultParams;
      const model = definition.build(params);
      const { compound, bounds } = assembleHero(model);
      setHero({ id: activeId, definition, model, bounds, compound, params });
    } catch (err) {
      console.error(`Failed to build hero "${activeId}":`, err);
    }
  }, [status, activeId]);

  const handleExport = (kind: "step" | "stl") => {
    if (!hero) return;
    try {
      const blob = kind === "step" ? hero.compound.blobSTEP() : hero.compound.blobSTL();
      downloadBlob(blob, `katacad-${hero.id}.${kind}`);
    } catch (err) {
      console.error(`${kind.toUpperCase()} export failed:`, err);
    }
  };

  return (
    <main className="flex h-screen flex-col">
      <header className="border-b p-4">
        <h1>KatACAD — Studio</h1>
        <p>Layer 1 heroes: real parametric Replicad assemblies with looping mechanism animation.</p>
        <p>
          Kernel status: {status}
          {hero ? ` — showing ${hero.definition.label}` : ""}
        </p>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={() => handleExport("step")} disabled={!hero}>
            Export STEP
          </button>
          <button type="button" onClick={() => handleExport("stl")} disabled={!hero}>
            Export STL
          </button>
        </div>
      </header>

      <section className="flex-1">
        <Viewport>
          {hero ? (
            <HeroScene
              key={hero.id}
              model={hero.model}
              bounds={hero.bounds}
              animate={(elapsed) => hero.definition.animate(elapsed, hero.params)}
            />
          ) : null}
        </Viewport>
      </section>

      <HeroGallery activeId={hero?.id ?? null} onSelect={setActiveId} disabled={status !== "ready"} />
    </main>
  );
}
