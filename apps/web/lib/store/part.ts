// Zustand store carrying the current part across to the dossier route.
//
// The studio loads a part; the "Dossier" button is a client-side navigation,
// so the live (already-built) part is handed over in-memory through this
// store — no rebuilding, no re-fetching.
import type { AnyShape } from "replicad";
import { create } from "zustand";

import type { HeroBounds, HeroModel, HeroParams } from "@/lib/replicad/heroes";

export interface PartSnapshot {
  kind: "hero" | "archetype" | "layer3";
  key: string;
  label: string;
  model: HeroModel;
  bounds: HeroBounds;
  /** The assembled B-Rep — used for projections, measurement, and export. */
  shape: AnyShape;
  params: HeroParams;
  /** The prompt that produced this part, when it came from one. */
  prompt: string | null;
}

interface PartStore {
  part: PartSnapshot | null;
  setPart: (part: PartSnapshot) => void;
}

export const usePartStore = create<PartStore>((set) => ({
  part: null,
  setPart: (part) => set({ part }),
}));
