// Inventor-style engineering nomenclature for feature-tree nodes.
//
// Semantic node names ("sun", "planet_0", "bolt_holes") are relabelled for
// display as snake_case identifiers with a two-digit instance suffix
// ("sun_01", "planet_01", "bolt_holes_01"). This is display-only — the
// underlying node.name is left untouched, so animation lookup and viewport
// selection still resolve correctly.

/** Relabel a semantic node name into an engineering identifier. */
export function toEngineeringLabel(name: string): string {
  const normalised = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  // A trailing number becomes a 1-based, zero-padded instance suffix.
  const match = normalised.match(/^(.*?)_?(\d+)$/);
  if (match && match[1]) {
    const instance = Number.parseInt(match[2], 10) + 1;
    return `${match[1]}_${String(instance).padStart(2, "0")}`;
  }
  return `${normalised || "feature"}_01`;
}
