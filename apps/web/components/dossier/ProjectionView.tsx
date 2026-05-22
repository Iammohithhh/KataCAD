// Renders one orthographic/isometric projection as an SVG technical view —
// visible edges solid, hidden edges dashed (blueprint convention).
import type { ProjectionView as Projection } from "@/lib/dossier/projections";

export interface ProjectionViewProps {
  view: Projection;
}

export function ProjectionView({ view }: ProjectionViewProps) {
  return (
    <figure className="border p-2">
      <figcaption className="mb-1 font-mono text-[11px] uppercase">{view.label}</figcaption>
      <svg
        viewBox={view.viewBox}
        className="h-44 w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Hidden edges are drawn faint so a dense part (e.g. a gear seen
            edge-on) reads as a light wash, not a solid black smear. */}
        <g opacity={0.28}>
          {view.hiddenPaths.map((d, index) => (
            <path
              key={`hidden-${index}`}
              d={d}
              fill="none"
              stroke="black"
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
            stroke="black"
            strokeWidth={0.7}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </figure>
  );
}
