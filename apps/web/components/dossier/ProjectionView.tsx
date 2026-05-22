// Renders one orthographic/isometric projection as an SVG technical view —
// visible edges solid, hidden edges dashed (blueprint convention) — framed
// inside a hairline cell with blueprint-style corner brackets.
import type { ProjectionView as Projection } from "@/lib/dossier/projections";

export interface ProjectionViewProps {
  view: Projection;
}

function CornerBrackets() {
  // Four 8-px L-brackets, one in each corner of the framed cell.
  return (
    <svg
      className="pointer-events-none absolute inset-0 text-ink-faint"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.4"
      aria-hidden="true"
    >
      <path d="M0 6 L0 0 L6 0" />
      <path d="M94 0 L100 0 L100 6" />
      <path d="M100 94 L100 100 L94 100" />
      <path d="M6 100 L0 100 L0 94" />
    </svg>
  );
}

export function ProjectionView({ view }: ProjectionViewProps) {
  return (
    <figure className="relative flex flex-col gap-2 border border-line bg-surface p-3">
      <CornerBrackets />
      <figcaption className="flex items-baseline justify-between font-mono text-2xs uppercase tracking-[0.14em] text-ink-muted">
        <span>{view.label}</span>
        <span className="text-ink-faint">view</span>
      </figcaption>
      <svg
        viewBox={view.viewBox}
        className="h-44 w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Hidden edges are drawn faint so a dense part (e.g. a gear seen
            edge-on) reads as a light wash, not a solid smear. */}
        <g opacity={0.26}>
          {view.hiddenPaths.map((d, index) => (
            <path
              key={`hidden-${index}`}
              d={d}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.3}
              strokeDasharray="2 1.6"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>
        {view.visiblePaths.map((d, index) => (
          <path
            key={`visible-${index}`}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.7}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </figure>
  );
}
