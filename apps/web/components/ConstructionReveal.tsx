"use client";

// The signature moment — when a new part lands in the viewport, a set of
// engineering construction lines (datum crosshair, build envelope, corner
// registration brackets) draws itself in, holds for a beat, then fades out as
// the part settles. Purely a DOM overlay; it never touches the 3D scene.
//
// The parent remounts this with a changing `key` so it replays on every load.
import { useEffect, useState, type CSSProperties } from "react";

// pathLength={1} normalises every shape's length to 1, so a single
// stroke-dashoffset animation draws them all uniformly.
const DRAW: CSSProperties = { "--dash": "1" } as CSSProperties;

export function ConstructionReveal() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), 1150);
    return () => clearTimeout(timer);
  }, []);

  if (done) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <svg
        viewBox="0 0 120 120"
        className="h-[66%] max-h-[460px] animate-reveal-fade text-royal"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g style={DRAW}>
          {/* Corner registration brackets — the build envelope. */}
          <path
            className="animate-reveal-draw"
            pathLength={1}
            strokeDasharray={1}
            d="M10 30 L10 10 L30 10 M90 10 L110 10 L110 30 M110 90 L110 110 L90 110 M30 110 L10 110 L10 90"
          />
          {/* Datum crosshair. */}
          <path
            className="animate-reveal-draw [animation-delay:60ms]"
            pathLength={1}
            strokeDasharray={1}
            d="M60 6 L60 114 M6 60 L114 60"
          />
          {/* Build circle. */}
          <circle
            className="animate-reveal-draw [animation-delay:120ms]"
            pathLength={1}
            strokeDasharray={1}
            cx="60"
            cy="60"
            r="29"
          />
          {/* Witness ticks along the datum axes. */}
          <path
            className="animate-reveal-draw [animation-delay:170ms]"
            pathLength={1}
            strokeDasharray={1}
            d="M36 56 L36 64 M84 56 L84 64 M56 36 L64 36 M56 84 L64 84"
          />
        </g>
      </svg>
    </div>
  );
}
