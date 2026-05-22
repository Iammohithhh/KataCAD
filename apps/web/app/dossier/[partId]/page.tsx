"use client";

// The /dossier/[partId] route — the A3 technical data sheet. The real UI is
// in DossierClient and loads with `ssr: false` because it depends on the
// OpenCascade WASM bundle (for orthographic projections).
import dynamic from "next/dynamic";

const DossierClient = dynamic(() => import("./DossierClient"), {
  ssr: false,
  loading: () => <p>Loading dossier...</p>,
});

export default function DossierPage() {
  return <DossierClient />;
}
