"use client";

// The generation interface — shown over the viewport while a prompt is being
// turned into geometry. A blueprint grid, a scanning line and staged pipeline
// steps give every prompt the feel of a CAD kernel building the part, the way
// Fusion 360 or SolidWorks shows a rebuild. The work is real underneath; this
// just paces the reveal so nothing looks pre-baked or instant.
import { useEffect, useState } from "react";

import { BrandMark } from "@/components/Wordmark";

const STAGES = [
  "Parsing design intent",
  "Resolving parametric constraints",
  "Building B-Rep solid",
  "Tessellating display mesh",
] as const;

const STAGE_MS = 640;

export interface GenerationScreenProps {
  /** The prompt being generated — echoed back to the visitor. */
  prompt: string;
  /** Fired once the staged animation has run its full course. */
  onStagesComplete: () => void;
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      className="h-3 w-3 text-azure"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 6.2 L5 8.6 L9.5 3.4" />
    </svg>
  );
}

export function GenerationScreen({ prompt, onStagesComplete }: GenerationScreenProps) {
  const [stage, setStage] = useState(0);
  const complete = stage >= STAGES.length;

  useEffect(() => {
    if (complete) return;
    const timer = setTimeout(() => setStage((s) => s + 1), STAGE_MS);
    return () => clearTimeout(timer);
  }, [stage, complete]);

  useEffect(() => {
    if (complete) onStagesComplete();
  }, [complete, onStagesComplete]);

  const progress = Math.min(stage, STAGES.length) / STAGES.length;

  return (
    <div className="absolute inset-0 z-20 overflow-hidden bg-midnight-surge">
      <div className="blueprint-grid absolute inset-0" />
      {/* Scanning line. */}
      <div className="absolute inset-x-0 top-0 h-24 animate-scan-y bg-gradient-to-b from-transparent via-azure/15 to-transparent" />

      <div className="relative flex h-full items-center justify-center p-6">
        <div className="w-[420px] max-w-[90%] animate-fade-in rounded-lg border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <BrandMark className="h-4 w-4" />
            <span className="font-mono text-2xs uppercase tracking-[0.18em] text-white/60">
              {complete ? "Finalizing" : "Generating"}
            </span>
            <span className="ml-auto h-1.5 w-1.5 animate-pulse-soft rounded-full bg-azure" />
          </div>

          <p className="mt-3 truncate font-mono text-xs text-white/45">
            &ldquo;{prompt}&rdquo;
          </p>

          <div className="mt-5 flex flex-col gap-3">
            {STAGES.map((label, index) => {
              const done = index < stage;
              const active = index === stage;
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="font-mono text-2xs text-white/35">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`flex-1 text-[13px] transition ${
                      done
                        ? "text-white/70"
                        : active
                          ? "text-white"
                          : "text-white/30"
                    }`}
                  >
                    {label}
                  </span>
                  <span className="flex h-4 w-4 items-center justify-center">
                    {done ? (
                      <CheckIcon />
                    ) : active ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/15 border-t-azure" />
                    ) : (
                      <span className="h-1 w-1 rounded-full bg-white/25" />
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-futurewave transition-[width] duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="mt-2.5 font-mono text-2xs text-white/35">
            {complete
              ? "geometry complete — placing part in viewport"
              : "katacad kernel · parametric B-Rep pipeline"}
          </p>
        </div>
      </div>
    </div>
  );
}
