// The 3D token file.
//
// Three.js materials and lights take JavaScript hex/colour values, not Tailwind
// classes — so the viewport palette lives here. This file and
// `tailwind.config.ts` are the only two places a colour literal may appear;
// the values below are kept in sync with the Tailwind tokens by hand.

/** Viewport surface + part materials. */
export const VIEWPORT = {
  /** Soft cool off-white behind the canvas — avoids pure-white glare. */
  backdropTop: "#FBFCFE",
  backdropBottom: "#E7EAF2",
  /** Machined-aluminium base colour for part faces. */
  partColor: "#AEB4C0",
  partMetalness: 0.62,
  partRoughness: 0.38,
  /** Azure — a feature-tree node selected for inspection. */
  selectedColor: "#2277FF",
  selectedMetalness: 0.5,
  selectedRoughness: 0.32,
  /** B-Rep edge lines drawn over the shaded solid. */
  edgeColor: "#1B2030",
  /** Soft contact-shadow colour on the ground. */
  shadowColor: "#0B0D12",
} as const;

/** The cinematic three-point lighting rig. */
export const LIGHTING = {
  ambient: 0.32,
  hemisphereSky: "#EAF0FF",
  hemisphereGround: "#E6E0D6",
  hemisphereIntensity: 0.45,
  /** Warm key light — the dominant source. */
  keyColor: "#FFF3E2",
  keyIntensity: 2.5,
  /** Cool fill — lifts the shadow side. */
  fillColor: "#DCE6FF",
  fillIntensity: 0.7,
  /** Cool rim — separates the part from the background. */
  rimColor: "#F2F5FF",
  rimIntensity: 1.15,
  /** Bright soft-box colour for the procedural environment map. */
  envBright: "#FFFFFF",
} as const;
