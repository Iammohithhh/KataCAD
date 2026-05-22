// Hero — automotive differential gear set.
//
// A carrier drum (with a cross pin and viewing windows) carries the ring
// gear, two side gears on the main axis, and two spider gears on the cross
// pin. The whole carrier rotates; the spiders also spin on the pin.
import { makeCylinder, type Shape3D } from "replicad";

import { animateDifferential, DIFFERENTIAL_NODES } from "@/lib/animations/differential";

import { makeSpurGear } from "./gear";
import { node, type HeroDefinition, type HeroModel, type Vec3 } from "./types";
import { param } from "./util";

const MODULE = 3;
const DRUM_HALF_WIDTH = 28;

function buildDifferential(params: Record<string, number>): HeroModel {
  const ringTeeth = Math.round(param(params, "ringTeeth", 46));
  const drumRadius = param(params, "drumRadius", 46);
  const gearThickness = param(params, "gearThickness", 16);

  // Carrier: a drum with a cross pin through it and a round window on each
  // side so the internal gears are visible.
  let carrier: Shape3D = makeCylinder(
    drumRadius,
    DRUM_HALF_WIDTH * 2,
    [0, 0, -DRUM_HALF_WIDTH],
    [0, 0, 1],
  );
  carrier = carrier.cut(
    makeCylinder(drumRadius * 0.62, drumRadius * 4, [0, -drumRadius * 2, 0], [0, 1, 0]),
  );
  carrier = carrier.fuse(
    makeCylinder(6, drumRadius * 2.4, [-drumRadius * 1.2, 0, 0], [1, 0, 0]),
  );

  // Ring gear bolted to one face of the drum.
  const ring = makeSpurGear({
    teeth: ringTeeth,
    module: MODULE,
    thickness: gearThickness,
    boreRadius: drumRadius * 0.55,
  });

  // Two side gears on the main (Z) axis, facing each other.
  const sideGear = makeSpurGear({
    teeth: 15,
    module: MODULE,
    thickness: 20,
    boreRadius: 8,
  });

  // Two spider gears on the cross pin (built about Z, turned onto the X axis).
  const spiderGear = makeSpurGear({
    teeth: 11,
    module: MODULE,
    thickness: 13,
    boreRadius: 6,
  });

  const root = node({
    name: "differential",
    children: [
      node({
        name: DIFFERENTIAL_NODES.carrier,
        shape: carrier,
        children: [
          node({
            name: DIFFERENTIAL_NODES.ring,
            shape: ring,
            position: [0, 0, DRUM_HALF_WIDTH + gearThickness / 2] as Vec3,
          }),
          node({
            name: DIFFERENTIAL_NODES.sideGear(0),
            shape: sideGear,
            position: [0, 0, -13] as Vec3,
          }),
          node({
            name: DIFFERENTIAL_NODES.sideGear(1),
            shape: sideGear,
            position: [0, 0, 13] as Vec3,
          }),
          node({
            name: DIFFERENTIAL_NODES.spiderGear(0),
            shape: spiderGear,
            position: [16, 0, 0] as Vec3,
            rotation: [0, Math.PI / 2, 0] as Vec3,
          }),
          node({
            name: DIFFERENTIAL_NODES.spiderGear(1),
            shape: spiderGear,
            position: [-16, 0, 0] as Vec3,
            rotation: [0, Math.PI / 2, 0] as Vec3,
          }),
        ],
      }),
    ],
  });

  return {
    root,
    sliders: [
      { key: "ringTeeth", label: "Ring gear teeth", min: 36, max: 56, step: 1 },
      { key: "drumRadius", label: "Carrier radius (mm)", min: 38, max: 58, step: 1 },
      { key: "gearThickness", label: "Ring thickness (mm)", min: 10, max: 24, step: 1 },
    ],
  };
}

export const differentialDefinition: HeroDefinition = {
  id: "differential",
  label: "Differential Gear Set",
  defaultParams: { ringTeeth: 46, drumRadius: 46, gearThickness: 16 },
  build: buildDifferential,
  animate: animateDifferential,
};
