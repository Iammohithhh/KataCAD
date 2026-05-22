// Hero — bicycle frame.
//
// A diamond frame of tubes, a fork, two spoked wheels, a crankset, plus
// handlebar and saddle. Built in side view (the X-Z plane); wheels and
// crank turn on the Y axis.
import { drawRoundedRectangle, makeBaseBox, makeCylinder, type Shape3D } from "replicad";

import { animateBicycle, BICYCLE_NODES } from "@/lib/animations/bicycle";

import { makeSpurGear } from "./gear";
import { node, type HeroDefinition, type HeroModel, type Vec3 } from "./types";
import { extrudeOn, makeTorus, param, tubeBetween } from "./util";

const TUBE_RADIUS = 9;

/** A spoked wheel, built flat in the X-Y plane (axle along Z). */
function makeWheel(radius: number): Shape3D {
  const rimRadius = radius - 16;
  let wheel: Shape3D = makeTorus(radius, 11); // tire — slim road profile
  wheel = wheel.fuse(makeTorus(rimRadius, 6)); // rim
  wheel = wheel.fuse(makeCylinder(11, 30, [0, 0, -15], [0, 0, 1])); // hub

  const spokeCount = 14;
  for (let i = 0; i < spokeCount; i += 1) {
    const angle = (2 * Math.PI * i) / spokeCount;
    const inner: Vec3 = [10 * Math.cos(angle), 10 * Math.sin(angle), 0];
    const outer: Vec3 = [rimRadius * Math.cos(angle), rimRadius * Math.sin(angle), 0];
    wheel = wheel.fuse(tubeBetween(inner, outer, 1.8));
  }
  return wheel;
}

/** Chainring with two crank arms and pedals, built flat in the X-Y plane. */
function makeCrankset(): Shape3D {
  let crankset: Shape3D = makeSpurGear({
    teeth: 38,
    module: 2.4,
    thickness: 5,
    boreRadius: 9,
  });
  const armLength = 95;
  const arm = makeBaseBox(armLength, 11, 7);
  crankset = crankset.fuse(arm.clone().translateX(armLength / 2));
  crankset = crankset.fuse(arm.clone().translateX(-armLength / 2));
  crankset = crankset.fuse(makeCylinder(7, 34, [armLength, 0, 0], [0, 0, 1]));
  crankset = crankset.fuse(makeCylinder(7, 34, [-armLength, 0, -34], [0, 0, 1]));
  return crankset;
}

function buildBicycle(params: Record<string, number>): HeroModel {
  const wheelRadius = param(params, "wheelRadius", 165);
  const wheelbase = param(params, "wheelbase", 560);
  const tubeRadius = param(params, "tubeRadius", TUBE_RADIUS);

  // Key frame points in the X-Z side-view plane.
  const rearAxle: Vec3 = [0, 0, wheelRadius];
  const frontAxle: Vec3 = [wheelbase, 0, wheelRadius];
  const bottomBracket: Vec3 = [wheelbase * 0.4, 0, wheelRadius * 0.56];
  const seatTop: Vec3 = [wheelbase * 0.46, 0, wheelRadius * 2.2];
  const headTop: Vec3 = [wheelbase * 0.84, 0, wheelRadius * 2.0];
  const headBottom: Vec3 = [wheelbase * 0.9, 0, wheelRadius * 1.1];

  // Diamond frame — six tubes fused into one part.
  let frame = tubeBetween(bottomBracket, rearAxle, tubeRadius); // chain stay
  frame = frame.fuse(tubeBetween(bottomBracket, seatTop, tubeRadius)); // seat tube
  frame = frame.fuse(tubeBetween(seatTop, rearAxle, tubeRadius * 0.7)); // seat stay
  frame = frame.fuse(tubeBetween(bottomBracket, headBottom, tubeRadius)); // down tube
  frame = frame.fuse(tubeBetween(seatTop, headTop, tubeRadius)); // top tube
  frame = frame.fuse(tubeBetween(headBottom, headTop, tubeRadius)); // head tube

  const fork = tubeBetween(headBottom, frontAxle, tubeRadius * 0.85);

  // Handlebar: a stem rising from the head-tube top to a grip bar set clearly
  // above and behind the front wheel, so it never fouls the tire.
  const gripCenter: Vec3 = [headTop[0] - 18, 0, headTop[2] + 68];
  let handlebar = tubeBetween(headTop, gripCenter, 7);
  handlebar = handlebar.fuse(
    makeCylinder(7, 200, [gripCenter[0], -100, gripCenter[2]], [0, 1, 0]),
  );

  const seat = extrudeOn(drawRoundedRectangle(96, 58, 22), "XY", 16);

  const wheel = makeWheel(wheelRadius);
  const crankset = makeCrankset();

  const root = node({
    name: "bicycle",
    children: [
      node({ name: BICYCLE_NODES.frame, shape: frame }),
      node({ name: BICYCLE_NODES.fork, shape: fork }),
      node({ name: BICYCLE_NODES.handlebar, shape: handlebar }),
      node({
        name: BICYCLE_NODES.seat,
        shape: seat,
        position: [seatTop[0], seatTop[1], seatTop[2] + 12] as Vec3,
      }),
      node({
        name: BICYCLE_NODES.rearWheel,
        shape: wheel,
        position: rearAxle,
        rotation: [Math.PI / 2, 0, 0],
      }),
      node({
        name: BICYCLE_NODES.frontWheel,
        shape: wheel,
        position: frontAxle,
        rotation: [Math.PI / 2, 0, 0],
      }),
      node({
        name: BICYCLE_NODES.crankset,
        shape: crankset,
        position: bottomBracket,
        rotation: [Math.PI / 2, 0, 0],
      }),
    ],
  });

  return {
    root,
    sliders: [
      { key: "wheelRadius", label: "Wheel radius (mm)", min: 130, max: 200, step: 1 },
      { key: "wheelbase", label: "Wheelbase (mm)", min: 480, max: 660, step: 2 },
      { key: "tubeRadius", label: "Frame tube radius (mm)", min: 6, max: 14, step: 0.5 },
    ],
  };
}

export const bicycleDefinition: HeroDefinition = {
  id: "bicycle",
  label: "Bicycle Frame",
  defaultParams: { wheelRadius: 165, wheelbase: 560, tubeRadius: TUBE_RADIUS },
  build: buildBicycle,
  animate: animateBicycle,
};
