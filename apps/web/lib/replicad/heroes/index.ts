// Barrel for the Layer 1 hero layer.
export {
  node,
  type Vec3,
  type HeroParams,
  type HeroNode,
  type NodeMotion,
  type AnimationFrame,
  type SliderDef,
  type HeroModel,
  type HeroDefinition,
} from "./types";
export {
  HERO_GALLERY,
  getHero,
  type HeroGalleryEntry,
} from "./registry";
export { assembleHero, type AssembledHero, type HeroBounds } from "./flatten";
export { loadArchetype, type LoadedArchetype } from "./archetype";
