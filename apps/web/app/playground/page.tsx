"use client";

// The /playground route. The real UI lives in PlaygroundClient and is loaded
// with `ssr: false` because it depends on the OpenCascade WASM bundle, which
// only runs in the browser. Server-rendering it would fail to hydrate.
import dynamic from "next/dynamic";

const PlaygroundClient = dynamic(() => import("./PlaygroundClient"), {
  ssr: false,
  loading: () => <p>Loading playground...</p>,
});

export default function PlaygroundPage() {
  return <PlaygroundClient />;
}
