"use client";

// React hook that owns the Replicad lifecycle for a client component.
//
// It initializes the OpenCascade WASM bundle exactly once and, when ready,
// exposes `buildPart` — a synchronous function that turns bracket parameters
// into both an exportable B-Rep shape and viewport-ready Three.js geometry.
import { useCallback, useEffect, useState } from "react";
import type { Shape3D } from "replicad";

import {
  buildBracket,
  initReplicad,
  tessellate,
  type BracketParams,
  type TessellatedShape,
} from "@/lib/replicad";

export type ReplicadStatus = "loading" | "ready" | "error";

export interface BracketBuild {
  /** The B-Rep solid — used for STEP / STL export. */
  shape: Shape3D;
  /** Tessellated face and edge geometry — used for rendering. */
  mesh: TessellatedShape;
}

export interface UseReplicadResult {
  status: ReplicadStatus;
  /** Build a bracket. Only call this once `status` is `"ready"`. */
  buildPart: (params: BracketParams) => BracketBuild;
}

export function useReplicad(): UseReplicadResult {
  const [status, setStatus] = useState<ReplicadStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    initReplicad()
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch((err: unknown) => {
        console.error("Replicad initialization failed:", err);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const buildPart = useCallback((params: BracketParams): BracketBuild => {
    const shape = buildBracket(params);
    return { shape, mesh: tessellate(shape) };
  }, []);

  return { status, buildPart };
}
