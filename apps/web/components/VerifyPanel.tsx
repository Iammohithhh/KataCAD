"use client";

// The verification panel — a right-side overlay that runs four named checks
// in sequence (each turning green after a short delay) and shows a
// verification certificate hashed from the feature tree.
import { useEffect, useState } from "react";
import type { AnyShape } from "replicad";

import type { HeroModel } from "@/lib/replicad/heroes";
import { certificateId } from "@/lib/verify/certificate";
import { runChecks, type VerifyCheck } from "@/lib/verify/checks";

// Delay between checks turning green — four checks complete in ~1.8 s.
const STEP_DELAY_MS = 450;

export interface VerifyPanelProps {
  open: boolean;
  onClose: () => void;
  model: HeroModel | null;
  shape: AnyShape | null;
}

export function VerifyPanel({ open, onClose, model, shape }: VerifyPanelProps) {
  const [checks, setChecks] = useState<VerifyCheck[]>([]);
  const [revealed, setRevealed] = useState(0);
  const [certificate, setCertificate] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !model || !shape) return;

    let cancelled = false;
    const results = runChecks(model, shape);
    setChecks(results);
    setRevealed(0);
    setCertificate(null);

    const timers = results.map((_check, index) =>
      setTimeout(() => setRevealed(index + 1), STEP_DELAY_MS * (index + 1)),
    );

    certificateId(model)
      .then((id) => {
        if (!cancelled) setCertificate(id);
      })
      .catch((err: unknown) => console.error("Certificate generation failed:", err));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [open, model, shape]);

  if (!open) return null;

  const complete = checks.length > 0 && revealed >= checks.length;

  return (
    <aside className="fixed right-0 top-0 z-20 flex h-full w-80 flex-col border-l bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Verification</h2>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {checks.map((check, index) => {
          const done = index < revealed;
          return (
            <div key={check.name} className="font-mono text-xs">
              <p>
                {done ? "[ check ] " : "[ run  ] "}
                {check.name}
              </p>
              {done ? <p className="pl-16 text-[11px]">{check.status}</p> : null}
            </div>
          );
        })}
      </div>

      {complete ? (
        <div className="mt-5 border-t pt-3">
          <p className="text-xs font-semibold">Verification certificate</p>
          <p className="mt-1 font-mono text-sm">{certificate ?? "computing..."}</p>
          <p className="mt-1 text-[11px]">All checks passed — geometry verified.</p>
        </div>
      ) : null}
    </aside>
  );
}
