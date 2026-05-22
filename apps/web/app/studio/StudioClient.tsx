"use client";

// Studio — a prompt routes to a Layer 1 hero, a Layer 2 archetype, or a
// Layer 3 retrieved part. The Verify button runs the verification sequence;
// the Dossier button opens the A3 technical data sheet.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { GenerateResponse, HeroId } from "@katacad/shared";
import type { AnyShape } from "replicad";

import { FeatureTree } from "@/components/FeatureTree";
import { HeroGallery } from "@/components/HeroGallery";
import { HeroScene } from "@/components/HeroScene";
import { ParameterSliders } from "@/components/ParameterSliders";
import { PromptInput } from "@/components/PromptInput";
import { VerifyPanel } from "@/components/VerifyPanel";
import { Viewport } from "@/components/Viewport";
import { generateLayer2, generateLayer3 } from "@/lib/api/generate";
import { routePrompt } from "@/lib/api/route";
import { useReplicad } from "@/lib/hooks/useReplicad";
import { downloadBlob } from "@/lib/replicad";
import {
  assembleHero,
  getHero,
  loadArchetype,
  type AnimationFrame,
  type HeroBounds,
  type HeroModel,
  type HeroParams,
} from "@/lib/replicad/heroes";
import { usePartStore } from "@/lib/store/part";

const FALLBACK_HERO: HeroId = "gearbox";
const STATIC_ANIMATION = (): AnimationFrame => ({});

type StudioRequest =
  | { kind: "hero"; id: HeroId; params: HeroParams }
  | { kind: "archetype"; name: string; params: HeroParams }
  | { kind: "layer3"; prompt: string; params: HeroParams };

type PartKind = "hero" | "archetype" | "layer3";

interface LoadedPart {
  kind: PartKind;
  key: string;
  label: string;
  model: HeroModel;
  bounds: HeroBounds;
  /** The assembled B-Rep — export, verification, projections. */
  shape: AnyShape;
  params: HeroParams;
  animate: (elapsedSeconds: number, params: HeroParams) => AnimationFrame;
}

export default function StudioClient() {
  const { status } = useReplicad();
  const router = useRouter();
  const setPart = usePartStore((state) => state.setPart);

  const [request, setRequest] = useState<StudioRequest>({
    kind: "hero",
    id: FALLBACK_HERO,
    params: {},
  });
  const [loaded, setLoaded] = useState<LoadedPart | null>(null);
  const [routing, setRouting] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);

  // The prompt that produced the current part (null when loaded from the gallery).
  const lastPrompt = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "ready") return;
    let cancelled = false;

    const commit = (part: LoadedPart): void => {
      if (cancelled) return;
      setLoaded(part);
      setPart({
        kind: part.kind,
        key: part.key,
        label: part.label,
        model: part.model,
        bounds: part.bounds,
        shape: part.shape,
        params: part.params,
        prompt: lastPrompt.current,
      });
    };

    const buildHero = (id: HeroId, params: HeroParams): void => {
      const definition = getHero(id);
      if (!definition) {
        console.error(`No hero definition registered for "${id}".`);
        return;
      }
      try {
        const merged: HeroParams = { ...definition.defaultParams, ...params };
        const model = definition.build(merged);
        const { compound, bounds } = assembleHero(model);
        commit({
          kind: "hero",
          key: id,
          label: definition.label,
          model,
          bounds,
          shape: compound,
          params: merged,
          animate: definition.animate,
        });
      } catch (err) {
        console.error(`Failed to build hero "${id}":`, err);
      }
    };

    void (async () => {
      if (request.kind === "hero") {
        buildHero(request.id, request.params);
        return;
      }
      try {
        let response: GenerateResponse;
        let key: string;
        if (request.kind === "archetype") {
          response = await generateLayer2({ archetype: request.name, params: request.params });
          key = request.name;
        } else {
          response = await generateLayer3({ prompt: request.prompt, params: request.params });
          key = "retrieved";
        }
        const part = await loadArchetype(response);
        commit({
          kind: request.kind,
          key,
          label: response.metadata.label,
          model: part.model,
          bounds: part.bounds,
          shape: part.shape,
          params: request.params,
          animate: STATIC_ANIMATION,
        });
      } catch (err) {
        console.error("Part generation failed; loading fallback hero:", err);
        buildHero(FALLBACK_HERO, {});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, request, setPart]);

  const load = (next: StudioRequest): void => {
    setSelectedNode(null);
    setVerifyOpen(false);
    setRequest(next);
  };

  const handlePrompt = async (prompt: string): Promise<void> => {
    setRouting(true);
    lastPrompt.current = prompt;
    try {
      const result = await routePrompt(prompt);
      if (result.layer === 2 && result.archetype) {
        load({ kind: "archetype", name: result.archetype, params: result.params ?? {} });
      } else if (result.layer === 3) {
        load({ kind: "layer3", prompt, params: { scale: 1, ...result.params } });
      } else if (result.layer === 1 && result.hero && getHero(result.hero as HeroId)) {
        load({ kind: "hero", id: result.hero as HeroId, params: result.params ?? {} });
      } else {
        load({ kind: "hero", id: FALLBACK_HERO, params: {} });
      }
    } catch (err) {
      console.error("Prompt routing failed; loading fallback hero:", err);
      load({ kind: "hero", id: FALLBACK_HERO, params: {} });
    } finally {
      setRouting(false);
    }
  };

  const selectHero = (id: HeroId): void => {
    lastPrompt.current = null;
    load({ kind: "hero", id, params: {} });
  };

  const handleSliderChange = (key: string, value: number): void => {
    setRequest((current) => {
      const params = { ...current.params, [key]: value };
      if (current.kind === "hero") return { kind: "hero", id: current.id, params };
      if (current.kind === "archetype") return { kind: "archetype", name: current.name, params };
      return { kind: "layer3", prompt: current.prompt, params };
    });
  };

  const handleExport = (kind: "step" | "stl"): void => {
    if (!loaded) return;
    try {
      const blob = kind === "step" ? loaded.shape.blobSTEP() : loaded.shape.blobSTL();
      downloadBlob(blob, `katacad-${loaded.key}.${kind}`);
    } catch (err) {
      console.error(`${kind.toUpperCase()} export failed:`, err);
    }
  };

  const openDossier = (): void => {
    if (loaded) router.push(`/dossier/${loaded.key}`);
  };

  const galleryActiveId = loaded?.kind === "hero" ? (loaded.key as HeroId) : null;

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
          {loaded ? ` — showing ${loaded.label}` : ""}
        </p>

        <div className="mt-2 flex gap-2">
          <button type="button" onClick={() => setVerifyOpen(true)} disabled={!loaded}>
            Verify
          </button>
          <button type="button" onClick={openDossier} disabled={!loaded}>
            Dossier
          </button>
          <button type="button" onClick={() => handleExport("step")} disabled={!loaded}>
            Export STEP
          </button>
          <button type="button" onClick={() => handleExport("stl")} disabled={!loaded}>
            Export STL
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <section className="flex-1">
          <Viewport orthographic>
            {loaded ? (
              <HeroScene
                key={`${loaded.kind}:${loaded.key}`}
                model={loaded.model}
                bounds={loaded.bounds}
                animate={(elapsed) => loaded.animate(elapsed, loaded.params)}
                selectedNode={selectedNode}
              />
            ) : null}
          </Viewport>
        </section>

        <aside className="flex w-72 flex-col overflow-hidden border-l">
          <div className="flex-1 overflow-auto">
            {loaded ? (
              <FeatureTree
                root={loaded.model.root}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
              />
            ) : null}
          </div>
          <div className="border-t">
            {loaded ? (
              <ParameterSliders
                sliders={loaded.model.sliders}
                values={loaded.params}
                onChange={handleSliderChange}
                disabled={status !== "ready"}
              />
            ) : null}
          </div>
        </aside>
      </div>

      <HeroGallery
        activeId={galleryActiveId}
        onSelect={selectHero}
        disabled={status !== "ready"}
      />

      <VerifyPanel
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        model={loaded?.model ?? null}
        shape={loaded?.shape ?? null}
      />
    </main>
  );
}
