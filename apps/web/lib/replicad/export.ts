// Export helpers — turn a Replicad shape into downloadable CAD files.
import type { Shape3D } from "replicad";

/** Real STEP (AP242-class) export — opens in SolidWorks, Fusion, Onshape. */
export function exportSTEP(shape: Shape3D): Blob {
  return shape.blobSTEP();
}

/** Binary STL export — for slicers and mesh viewers. */
export function exportSTL(shape: Shape3D): Blob {
  return shape.blobSTL();
}

/** Trigger a browser download of a Blob under the given filename. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
