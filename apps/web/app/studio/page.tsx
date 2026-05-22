"use client";

// The /studio route — the real UI lives in StudioClient and loads with
// `ssr: false` because it depends on the OpenCascade WASM bundle. The
// branded loading screen below stands in until the chunk lands.
import dynamic from "next/dynamic";

import { Wordmark } from "@/components/Wordmark";

const StudioClient = dynamic(() => import("./StudioClient"), {
  ssr: false,
  loading: () => (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface text-ink">
      <Wordmark className="text-base" />
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-line-strong border-t-royal" />
        <span className="font-mono text-2xs uppercase tracking-[0.18em] text-ink-muted">
          Loading studio
        </span>
      </div>
    </main>
  ),
});

export default function StudioPage() {
  return <StudioClient />;
}
