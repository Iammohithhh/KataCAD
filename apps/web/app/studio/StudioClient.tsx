"use client";

// Phase 3 studio — type a prompt or click the gallery; the router picks a
// Layer 1 hero, the hero is built and animated, and it can be exported.
// Loaded client-side only (see page.tsx) because of the OpenCascade WASM.
import { useEffect, useState } from "react";

import type { HeroId } from "@katacad/shared";

import { HeroGallery } from "@/components/HeroGallery";
import { HeroScene } from "@/components/HeroScene";
import { PromptInput } from "@/components/PromptInput";
import { Viewport } from "@/components/Viewport";
import { routePrompt } from "@/lib/api/route";
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

// Loaded whenever a prompt is unclassifiable or the router is unreachable.
const FALLBACK_HERO: HeroId = "gearbox";

interface HeroRequest {
  id: HeroId;
  params: HeroParams;
}

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
  const [request, setRequest] = useState<HeroRequest>({ id: FALLBACK_HERO, params: {} });
  const [hero, setHero] = useState<LoadedHero | null>(null);
  const [routing, setRouting] = useState(false);

  useEffect(() => {
    if (status !== "ready") return;

    const definition = getHero(request.id);
    if (!definition) {
      console.error(`No hero definition registered for "${request.id}".`);
      return;
    }

    try {
      const params: HeroParams = { ...definition.defaultParams, ...request.params };
      const model = definition.build(params);
      const { compound, bounds } = assembleHero(model);
      setHero({ id: request.id, definition, model, bounds, compound, params });
    } catch (err) {
      console.error(`Failed to build hero "${request.id}":`, err);
    }
  }, [status, request]);

  const handlePrompt = async (prompt: string) => {
    setRouting(true);
    try {
      const result = await routePrompt(prompt);
      const matched =
        result.layer === 1 && result.hero && getHero(result.hero as HeroId)
          ? (result.hero as HeroId)
          : FALLBACK_HERO;
      setRequest({ id: matched, params: result.params ?? {} });
    } catch (err) {
      // Network error or timeout — the visitor still gets a hero, no error UI.
      console.error("Prompt routing failed; loading fallback hero:", err);
      setRequest({ id: FALLBACK_HERO, params: {} });
    } finally {
      setRouting(false);
    }
  };

  const handleSelect = (id: HeroId) => {
    setRequest({ id, params: {} });
  };

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
        <p>Describe a part in plain English, or pick a hero from the gallery below.</p>

        <div className="mt-2">
          <PromptInput onSubmit={handlePrompt} loading={routing} disabled={status !== "ready"} />
        </div>

        <p className="mt-2">
          Kernel status: {status}
          {routing ? " — routing prompt..." : ""}
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

      <HeroGallery activeId={hero?.id ?? null} onSelect={handleSelect} disabled={status !== "ready"} />
    </main>
  );
}
