"use client";

// Studio — a prompt routes to a Layer 1 hero, a Layer 2 archetype or a Layer 3
// part. The viewport, feature tree, sliders and dossier all surface the same
// underlying B-Rep. A Fusion-style generation screen paces each prompt reveal
// so nothing looks pre-baked or instant.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { GenerateResponse, HeroId } from "@katacad/shared";
import type { AnyShape } from "replicad";

import { ConstructionReveal } from "@/components/ConstructionReveal";
import { FeatureTree } from "@/components/FeatureTree";
import { GenerationScreen } from "@/components/GenerationScreen";
import { HeroGallery } from "@/components/HeroGallery";
import { HeroScene } from "@/components/HeroScene";
import { ParameterSliders } from "@/components/ParameterSliders";
import { PromptInput } from "@/components/PromptInput";
import { NO_SECTION, SectionControl, type SectionState } from "@/components/SectionControl";
import { SpecSheet, type SpecSheetData } from "@/components/SpecSheet";
import { VerifyPanel } from "@/components/VerifyPanel";
import { Viewport } from "@/components/Viewport";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { generateLayer2, generateLayer3 } from "@/lib/api/generate";
import { routeWithFallback } from "@/lib/api/fallback";
import { getCachedHero, preloadHeroes } from "@/lib/cache/heroCache";
import { BOOTH_MODE } from "@/lib/config";
import { massGrams, measurePart } from "@/lib/dossier/measure";
import { useReplicad } from "@/lib/hooks/useReplicad";
import { getMaterial } from "@/lib/materials";
import { buildQuotePack } from "@/lib/quote/bundle";
import { downloadBlob } from "@/lib/replicad";
import {
  assembleHero,
  getHero,
  loadArchetype,
  type AnimationFrame,
  type HeroBounds,
  type HeroModel,
  type HeroNode,
  type HeroParams,
} from "@/lib/replicad/heroes";
import { usePartStore } from "@/lib/store/part";
import { certificateId } from "@/lib/verify/certificate";

const FALLBACK_HERO: HeroId = "gearbox";
const STATIC_ANIMATION = (): AnimationFrame => ({});
const DEFAULT_MATERIAL_ID = "aluminum-6061";

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
  shape: AnyShape;
  params: HeroParams;
  animate: (elapsedSeconds: number, params: HeroParams) => AnimationFrame;
}

/** Build a stable, short part id from the hash of the feature tree. */
function shortPartId(loaded: LoadedPart): string {
  // A non-cryptographic 5-char base36 hash of the feature-tree node names.
  const names: string[] = [];
  const walk = (n: HeroNode): void => {
    names.push(n.name);
    n.children.forEach(walk);
  };
  walk(loaded.model.root);
  let h = 5381;
  for (const s of names) {
    for (let i = 0; i < s.length; i += 1) {
      h = (h * 33) ^ s.charCodeAt(i);
    }
  }
  const slug = Math.abs(h).toString(36).toUpperCase().padStart(5, "0").slice(0, 5);
  return `KTN-${loaded.key.toUpperCase()}-${slug}`;
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
  const [section, setSection] = useState<SectionState>(NO_SECTION);

  // Generation pacing — separate from the build itself.
  const [generating, setGenerating] = useState(false);
  const [genPrompt, setGenPrompt] = useState("");
  const [genStagesDone, setGenStagesDone] = useState(false);

  // A sequence number bumped on every load() call; the commit() helper stamps
  // each commit with the seq it was built for. The reveal triggers when the
  // gen-screen animation is done AND the latest requested build has landed.
  const buildSeqRef = useRef(0);
  const [committedSeq, setCommittedSeq] = useState(0);

  // The prompt that produced the current part (null when loaded from the gallery).
  const lastPrompt = useRef<string | null>(null);

  // -------- build pipeline -------------------------------------------------
  useEffect(() => {
    if (status !== "ready") return;
    let cancelled = false;
    const targetSeq = buildSeqRef.current;

    const commit = (part: LoadedPart): void => {
      if (cancelled) return;
      setLoaded(part);
      setCommittedSeq(targetSeq);
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
        const cached =
          Object.keys(params).length === 0 ? getCachedHero(id) : undefined;
        let model: HeroModel;
        let bounds: HeroBounds;
        let shape: AnyShape;
        let merged: HeroParams;
        if (cached) {
          model = cached.model;
          bounds = cached.bounds;
          shape = cached.compound;
          merged = definition.defaultParams;
        } else {
          merged = { ...definition.defaultParams, ...params };
          model = definition.build(merged);
          const assembled = assembleHero(model);
          bounds = assembled.bounds;
          shape = assembled.compound;
        }
        commit({
          kind: "hero",
          key: id,
          label: definition.label,
          model,
          bounds,
          shape,
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
          response = await generateLayer2({
            archetype: request.name,
            params: request.params,
          });
          key = request.name;
        } else {
          response = await generateLayer3({
            prompt: request.prompt,
            params: request.params,
          });
          // "part" — never the word "retrieve" — in URLs and filenames.
          key = "part";
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

  // -------- pre-warm + reveal coordination ---------------------------------
  useEffect(() => {
    if (status === "ready") preloadHeroes();
  }, [status]);

  // Hide the generation screen when both the staged animation has played AND
  // the latest requested build has landed.
  useEffect(() => {
    if (!generating) return;
    if (genStagesDone && committedSeq === buildSeqRef.current) {
      setGenerating(false);
    }
  }, [generating, genStagesDone, committedSeq]);

  const onGenStagesComplete = useCallback(() => {
    setGenStagesDone(true);
  }, []);

  // -------- request gateway ------------------------------------------------
  const load = (next: StudioRequest): void => {
    buildSeqRef.current += 1;
    setSelectedNode(null);
    setVerifyOpen(false);
    setSection(NO_SECTION);
    setRequest(next);
  };

  const handlePrompt = async (prompt: string): Promise<void> => {
    setRouting(true);
    lastPrompt.current = prompt;
    setGenPrompt(prompt);
    setGenStagesDone(false);
    setGenerating(true);
    try {
      const result = await routeWithFallback(prompt);
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
    // Slider tweaks do NOT bump the build sequence — the reveal stays put.
    setRequest((current) => {
      const params = { ...current.params, [key]: value };
      if (current.kind === "hero") return { kind: "hero", id: current.id, params };
      if (current.kind === "archetype")
        return { kind: "archetype", name: current.name, params };
      return { kind: "layer3", prompt: current.prompt, params };
    });
  };

  // -------- actions --------------------------------------------------------
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

  const handleQuotePack = async (): Promise<void> => {
    if (!loaded) return;
    try {
      const measurements = measurePart(loaded.shape, loaded.bounds);
      const material = getMaterial(DEFAULT_MATERIAL_ID);
      const cert = await certificateId(loaded.model).catch(() => null);
      const components: string[] = [];
      const walk = (n: HeroNode): void => {
        for (const child of n.children) {
          components.push(child.name);
          walk(child);
        }
      };
      walk(loaded.model.root);

      const blob = await buildQuotePack({
        partLabel: loaded.label,
        partId: cert ?? shortPartId(loaded),
        prompt: lastPrompt.current,
        componentNames: components,
        material,
        bounds: loaded.bounds,
        volumeMm3: measurements.volume,
        massGrams: massGrams(measurements.volume, material.density),
        faces: measurements.faces,
        edges: measurements.edges,
        certificate: cert,
        date: new Date().toISOString().slice(0, 10),
      });
      downloadBlob(blob, `katacad-${loaded.key}-quote.zip`);
    } catch (err) {
      console.error("Quote pack build failed:", err);
    }
  };

  // -------- derived --------------------------------------------------------
  const specData: SpecSheetData | null = useMemo(() => {
    if (!loaded) return null;
    return {
      label: loaded.label,
      partId: shortPartId(loaded),
      root: loaded.model.root,
      bounds: loaded.bounds,
      faceCount: loaded.shape.faces.length,
      edgeCount: loaded.shape.edges.length,
    };
  }, [loaded]);

  const galleryActiveId = loaded?.kind === "hero" ? (loaded.key as HeroId) : null;
  const partReady = Boolean(loaded) && !generating && status === "ready";
  const actionsDisabled = !partReady;
  const kernelLoading = status !== "ready";

  const statusText = BOOTH_MODE
    ? generating
      ? "Generating"
      : kernelLoading
        ? "Initializing"
        : loaded
          ? loaded.label
          : "Ready"
    : `Kernel: ${status}${generating ? " · generating" : ""}${
        loaded ? ` · ${loaded.label}` : ""
      }`;

  return (
    <main className="flex h-screen flex-col bg-surface text-ink">
      {/* Top bar — wordmark, prompt, status. */}
      <header className="flex items-center gap-5 border-b border-line bg-surface px-5 py-3">
        <Wordmark />
        <div className="flex-1">
          <div className="mx-auto w-full max-w-[680px]">
            <PromptInput
              onSubmit={handlePrompt}
              loading={routing || generating}
              disabled={kernelLoading}
            />
          </div>
        </div>
        <span className="hidden shrink-0 items-center gap-2 rounded-sm border border-line bg-paper px-2.5 py-1 font-mono text-2xs uppercase tracking-wider text-ink-soft md:inline-flex">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              generating || kernelLoading
                ? "animate-pulse-soft bg-azure"
                : "bg-royal"
            }`}
          />
          {statusText}
        </span>
      </header>

      {/* Action toolbar. */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-paper/70 px-5 py-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setVerifyOpen(true)}
          disabled={actionsDisabled}
        >
          Verify
        </Button>
        <Button variant="outline" size="sm" onClick={openDossier} disabled={actionsDisabled}>
          Dossier
        </Button>
        <span className="mx-1 h-4 w-px bg-line" aria-hidden="true" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport("step")}
          disabled={actionsDisabled}
        >
          Export STEP
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport("stl")}
          disabled={actionsDisabled}
        >
          Export STL
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleQuotePack}
          disabled={actionsDisabled}
        >
          Quote pack
        </Button>
        <span className="ml-auto truncate font-mono text-2xs text-ink-faint">
          {loaded ? specData?.partId : ""}
        </span>
      </div>

      {/* Three-dock main. */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: engineering spec sheet. */}
        <aside className="hidden w-[240px] shrink-0 overflow-hidden border-r border-line bg-surface lg:flex lg:flex-col">
          <SpecSheet data={specData} generating={generating || kernelLoading} />
        </aside>

        {/* Center: viewport, section control, overlays. */}
        <section className="relative flex-1 overflow-hidden">
          <Viewport orthographic>
            {loaded ? (
              <HeroScene
                key={`${loaded.kind}:${loaded.key}`}
                model={loaded.model}
                bounds={loaded.bounds}
                animate={(elapsed) => loaded.animate(elapsed, loaded.params)}
                selectedNode={selectedNode}
                section={section}
              />
            ) : null}
          </Viewport>

          {partReady ? (
            <div className="pointer-events-auto absolute bottom-4 right-4 animate-fade-in">
              <SectionControl value={section} onChange={setSection} />
            </div>
          ) : null}

          {partReady ? <ConstructionReveal key={`reveal-${committedSeq}`} /> : null}

          {kernelLoading ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-3 rounded-md border border-line bg-surface/95 px-4 py-3 shadow-panel">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-line-strong border-t-royal" />
                <span className="font-mono text-2xs uppercase tracking-[0.18em] text-ink-muted">
                  Initializing CAD kernel
                </span>
              </div>
            </div>
          ) : null}

          {generating ? (
            <GenerationScreen prompt={genPrompt} onStagesComplete={onGenStagesComplete} />
          ) : null}
        </section>

        {/* Right: feature tree + parameter sliders. */}
        <aside className="flex w-[260px] shrink-0 flex-col overflow-hidden border-l border-line bg-surface">
          <div className="flex-1 overflow-auto">
            {loaded && !generating ? (
              <FeatureTree
                root={loaded.model.root}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
              />
            ) : (
              <div className="p-3">
                <p className="mb-2 font-mono text-2xs uppercase tracking-[0.14em] text-ink-faint">
                  Feature Tree
                </p>
                <div className="flex flex-col gap-2">
                  <div className="skeleton h-4 w-full rounded-sm" />
                  <div className="skeleton h-4 w-5/6 rounded-sm" />
                  <div className="skeleton h-4 w-4/6 rounded-sm" />
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-line">
            {loaded && !generating ? (
              <ParameterSliders
                sliders={loaded.model.sliders}
                values={loaded.params}
                onChange={handleSliderChange}
                disabled={kernelLoading}
              />
            ) : null}
          </div>
        </aside>
      </div>

      {/* Bottom: hero library. */}
      <HeroGallery
        activeId={galleryActiveId}
        onSelect={selectHero}
        disabled={kernelLoading}
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
