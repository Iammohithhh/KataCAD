// Offline keyword classifier — the third-tier router fallback.
//
// When the live router API is unreachable, this matches the prompt against
// hero and archetype keywords locally, with no network. Heroes are checked
// first so "gearbox" maps to the hero rather than the "gear" archetype.
import type { HeroId, RouteResponse } from "@katacad/shared";

const HERO_KEYWORDS: { id: HeroId; words: string[] }[] = [
  { id: "gearbox", words: ["gearbox", "planetary", "epicyclic", "planet gear"] },
  { id: "gripper", words: ["gripper", "robot hand", "robotic hand", "grasper"] },
  { id: "robot-arm", words: ["robot arm", "robotic arm", "manipulator", "six-axis", "six axis"] },
  { id: "quadcopter", words: ["quadcopter", "quadrotor", "drone"] },
  { id: "v-twin", words: ["v-twin", "v twin", "engine", "piston"] },
  { id: "differential", words: ["differential"] },
  { id: "bicycle", words: ["bicycle", "bike"] },
  { id: "nema-mount", words: ["nema", "motor mount", "stepper"] },
];

const ARCHETYPES = [
  "bracket",
  "flange",
  "plate",
  "shaft",
  "gear",
  "housing",
  "pulley",
  "hub",
  "manifold",
  "clamp",
];

/** Classify a prompt by keyword. Returns null when nothing matches. */
export function classifyByKeywords(prompt: string): RouteResponse | null {
  const text = prompt.toLowerCase();

  for (const { id, words } of HERO_KEYWORDS) {
    if (words.some((word) => text.includes(word))) {
      return { layer: 1, hero: id, archetype: null, params: {}, source: "fallback" };
    }
  }

  for (const archetype of ARCHETYPES) {
    if (text.includes(archetype)) {
      return { layer: 2, hero: null, archetype, params: {}, source: "fallback" };
    }
  }

  return null;
}
