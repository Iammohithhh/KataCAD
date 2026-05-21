"use client";

// The /studio route — the Layer 1 hero experience. The real UI is in
// StudioClient and loads with `ssr: false` because it depends on the
// OpenCascade WASM bundle, which runs only in the browser.
import dynamic from "next/dynamic";

const StudioClient = dynamic(() => import("./StudioClient"), {
  ssr: false,
  loading: () => <p>Loading studio...</p>,
});

export default function StudioPage() {
  return <StudioClient />;
}
