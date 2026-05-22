"use client";

// The /dossier/[partId] route — the A3 technical data sheet. The real UI is in
// DossierClient and loads with `ssr: false` because it depends on the
// OpenCascade WASM bundle (for orthographic projections).
import dynamic from "next/dynamic";

import { Wordmark } from "@/components/Wordmark";

const DossierClient = dynamic(() => import("./DossierClient"), {
  ssr: false,
  loading: () => (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface text-ink">
      <Wordmark />
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-line-strong border-t-royal" />
        <span className="font-mono text-2xs uppercase tracking-[0.18em] text-ink-muted">
          Preparing technical data sheet
        </span>
      </div>
    </main>
  ),
});

export default function DossierPage() {
  return <DossierClient />;
}
