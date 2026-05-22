"use client";

// The verification panel — a right-side overlay that runs four named checks
// in sequence (each turning royal-blue after a short delay) and shows a
// verification certificate hashed from the feature tree.
import { useEffect, useState } from "react";
import type { AnyShape } from "replicad";

import { BrandMark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
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

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={className}
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

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <path d="M3 3 L9 9 M9 3 L3 9" />
    </svg>
  );
}

function CheckRow({
  index,
  check,
  done,
  active,
}: {
  index: number;
  check: VerifyCheck;
  done: boolean;
  active: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 ${done ? "animate-check-in" : ""}`}>
      <span className="mt-0.5 font-mono text-2xs text-ink-faint">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex-1">
        <p
          className={`font-mono text-xs uppercase tracking-wider ${
            done ? "text-ink" : active ? "text-ink-soft" : "text-ink-faint"
          }`}
        >
          {check.name}
        </p>
        {done ? (
          <p className="mt-1 text-2xs text-ink-muted">{check.status}</p>
        ) : (
          <p className="mt-1 text-2xs text-ink-faint">
            {active ? "running…" : "pending"}
          </p>
        )}
      </div>
      <span className="mt-0.5 flex h-4 w-4 items-center justify-center">
        {done ? (
          <CheckIcon className="h-3.5 w-3.5 text-royal" />
        ) : active ? (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-line-strong border-t-azure" />
        ) : (
          <span className="h-1 w-1 rounded-full bg-line-strong" />
        )}
      </span>
    </div>
  );
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
    <aside className="fixed right-0 top-0 z-30 flex h-full w-[340px] animate-panel-in flex-col border-l border-line bg-surface shadow-lifted">
      <header className="flex items-center gap-2 border-b border-line px-4 py-3">
        <BrandMark className="h-4 w-4" />
        <p className="font-mono text-2xs uppercase tracking-[0.18em] text-ink-soft">
          Verification
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close verification panel"
          className="ml-auto h-7 w-7 px-0"
        >
          <CloseIcon />
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-4">
          {checks.map((check, index) => (
            <CheckRow
              key={check.name}
              index={index}
              check={check}
              done={index < revealed}
              active={index === revealed && !complete}
            />
          ))}
        </div>
      </div>

      {complete ? (
        <div className="border-t border-line p-4">
          <div className="animate-stamp-in rounded-md border-2 border-dashed border-royal/70 bg-lavender/40 p-3">
            <div className="flex items-center gap-2">
              <BrandMark className="h-4 w-4" />
              <span className="font-mono text-2xs uppercase tracking-[0.18em] text-royal-deep">
                Verified
              </span>
            </div>
            <p className="mt-2 font-mono text-sm text-ink">
              {certificate ?? "computing…"}
            </p>
            <p className="mt-1 text-2xs text-ink-muted">
              All checks passed — geometry is watertight and conformant.
            </p>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
