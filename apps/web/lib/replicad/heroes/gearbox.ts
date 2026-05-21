// Hero 1 — planetary gearbox.
//
// A sun gear at the center, N planet gears riding on a carrier, all running
// inside an internal ring gear. Tooth counts (12 / 18 / 48) satisfy
// ring = sun + 2 x planet, so the pitch circles mesh at a shared module.
import { makeCylinder, type Shape3D } from "replicad";

import { animateGearbox, GEARBOX_NODES } from "@/lib/animations/gearbox";

import { makeRingGear, makeSpurGear, pitchRadius } from "./gear";
import { node, type HeroDefinition, type HeroModel, type HeroNode, type Vec3 } from "./types";
import { param } from "./util";

const SUN_TEETH = 12;
const PLANET_TEETH = 18;
const RING_TEETH = 48; // = SUN_TEETH + 2 x PLANET_TEETH

const SUN_BORE = 7;
const PLANET_PIN_RADIUS = 6;

function buildGearbox(params: Record<string, number>): HeroModel {
  const gearModule = param(params, "module", 4);
  const thickness = param(params, "gearThickness", 20);
  const planetCount = Math.max(1, Math.round(param(params, "planetCount", 3)));

  const sunPitch = pitchRadius(SUN_TEETH, gearModule);
  const planetPitch = pitchRadius(PLANET_TEETH, gearModule);
  const ringPitch = pitchRadius(RING_TEETH, gearModule);
  const carrierRadius = sunPitch + planetPitch;
  const ringOuter = ringPitch + gearModule * 3;

  // --- gears -------------------------------------------------------------
  const sun = makeSpurGear({
    teeth: SUN_TEETH,
    module: gearModule,
    thickness,
    boreRadius: SUN_BORE,
  });
  const planet = makeSpurGear({
    teeth: PLANET_TEETH,
    module: gearModule,
    thickness,
    boreRadius: PLANET_PIN_RADIUS,
  });
  const ring = makeRingGear({
    teeth: RING_TEETH,
    module: gearModule,
    thickness,
    outerRadius: ringOuter,
  });

  // --- carrier (back plate + hub + one pin per planet) -------------------
  const carrierThickness = 8;
  const gap = 4;
  const plateBackZ = -(thickness / 2 + gap + carrierThickness);
  const pinBaseZ = -(thickness / 2 + gap);
  const pinLength = thickness + gap;

  const planetAngles: number[] = [];
  for (let i = 0; i < planetCount; i += 1) {
    planetAngles.push((2 * Math.PI * i) / planetCount);
  }

  let carrier: Shape3D = makeCylinder(
    carrierRadius + 10,
    carrierThickness,
    [0, 0, plateBackZ],
    [0, 0, 1],
  );
  carrier = carrier.fuse(
    makeCylinder(SUN_BORE + 6, pinLength + carrierThickness, [0, 0, plateBackZ], [0, 0, 1]),
  );
  for (const angle of planetAngles) {
    const px = carrierRadius * Math.cos(angle);
    const py = carrierRadius * Math.sin(angle);
    carrier = carrier.fuse(
      makeCylinder(PLANET_PIN_RADIUS, pinLength, [px, py, pinBaseZ], [0, 0, 1]),
    );
  }

  // --- scene graph -------------------------------------------------------
  const planetNodes: HeroNode[] = planetAngles.map((angle, index) => {
    const position: Vec3 = [
      carrierRadius * Math.cos(angle),
      carrierRadius * Math.sin(angle),
      0,
    ];
    return node({ name: GEARBOX_NODES.planet(index), shape: planet, position });
  });

  const root = node({
    name: "gearbox",
    children: [
      node({ name: GEARBOX_NODES.ring, shape: ring }),
      node({ name: GEARBOX_NODES.sun, shape: sun }),
      node({ name: GEARBOX_NODES.carrier, shape: carrier, children: planetNodes }),
    ],
  });

  return {
    root,
    sliders: [
      { key: "module", label: "Gear module (mm)", min: 2, max: 6, step: 0.5 },
      { key: "planetCount", label: "Planet count", min: 3, max: 5, step: 1 },
      { key: "gearThickness", label: "Gear thickness (mm)", min: 10, max: 30, step: 1 },
    ],
  };
}

export const gearboxDefinition: HeroDefinition = {
  id: "gearbox",
  label: "Planetary Gearbox",
  defaultParams: { module: 4, planetCount: 3, gearThickness: 20 },
  build: buildGearbox,
  animate: animateGearbox,
};
