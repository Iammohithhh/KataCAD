// Orthographic + isometric engineering projections via Replicad's
// drawProjection. Each view yields visible edges (solid) and hidden edges
// (dashed) as SVG path data plus a shared viewBox — the dossier renders them
// as a blueprint, and all-SVG views print to PDF cleanly.
import { drawProjection, ProjectionCamera, type AnyShape } from "replicad";

export interface ProjectionView {
  /** "Front" / "Top" / "Right" / "Isometric". */
  label: string;
  /** SVG viewBox string shared by the visible and hidden paths. */
  viewBox: string;
  /** Visible-edge path `d` attributes — drawn solid. */
  visiblePaths: string[];
  /** Hidden-edge path `d` attributes — drawn dashed. */
  hiddenPaths: string[];
}

/** `toSVGPaths` may return a flat or grouped list; normalize to a flat list. */
function flatten(paths: string[] | string[][]): string[] {
  const out: string[] = [];
  for (const entry of paths) {
    if (Array.isArray(entry)) out.push(...entry);
    else out.push(entry);
  }
  return out;
}

/** Compute the three first-angle orthographic views plus an isometric view. */
export function projectPart(shape: AnyShape): ProjectionView[] {
  const isometric = new ProjectionCamera([1, 1, 1]).lookAt(shape);
  const specs: { label: string; camera: "front" | "top" | "right" | ProjectionCamera }[] = [
    { label: "Front", camera: "front" },
    { label: "Top", camera: "top" },
    { label: "Right", camera: "right" },
    { label: "Isometric", camera: isometric },
  ];

  return specs.map(({ label, camera }) => {
    const { visible, hidden } = drawProjection(shape, camera);
    return {
      label,
      viewBox: visible.toSVGViewBox(6),
      visiblePaths: flatten(visible.toSVGPaths()),
      hiddenPaths: flatten(hidden.toSVGPaths()),
    };
  });
}
