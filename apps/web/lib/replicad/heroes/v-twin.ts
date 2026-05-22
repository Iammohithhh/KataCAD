// Hero — V-twin engine.
//
// A crankcase, a crankshaft on the Y axis, and two air-cooled cylinders
// splayed into a V. Each cylinder is a bored barrel stacked with cooling
// fins and an open head; a piston rides inside. The crank spins and the
// pistons reciprocate along their cylinder axes.
import { drawRoundedRectangle, makeCylinder, type Shape3D } from "replicad";

import { animateVTwin, VTWIN_NODES } from "@/lib/animations/v-twin";

import { node, type HeroDefinition, type HeroModel, type Vec3 } from "./types";
import { extrudeOn, param } from "./util";

const V_HALF_ANGLE = Math.PI / 8; // 22.5deg each side -> 45deg V
const CYLINDER_BASE_Z = 28; // where the cylinders meet the crankcase
const FIN_COUNT = 8;

/** One air-cooled cylinder: bored barrel + cooling fins + open head. */
function makeCylinderBarrel(length: number): Shape3D {
  const barrelOuter = 17;
  const bore = 13;

  let barrel = makeCylinder(barrelOuter, length, [0, 0, 0], [0, 0, 1]);
  barrel = barrel.cut(makeCylinder(bore, length * 1.2, [0, 0, -length * 0.1], [0, 0, 1]));

  // Cooling fins — thin wide disks stacked up the barrel.
  const finSpacing = (length - 16) / FIN_COUNT;
  for (let i = 0; i < FIN_COUNT; i += 1) {
    const fin = makeCylinder(26, 3, [0, 0, 8 + i * finSpacing], [0, 0, 1]).cut(
      makeCylinder(bore, 9, [0, 0, 5 + i * finSpacing], [0, 0, 1]),
    );
    barrel = barrel.fuse(fin);
  }

  // Open cylinder head — a wide ring capping the barrel.
  const head = makeCylinder(22, 12, [0, 0, length - 12], [0, 0, 1]).cut(
    makeCylinder(bore, 40, [0, 0, length - 30], [0, 0, 1]),
  );
  return barrel.fuse(head);
}

function buildVTwin(params: Record<string, number>): HeroModel {
  const barrelLength = param(params, "barrelLength", 72);
  const caseWidth = param(params, "caseWidth", 74);
  const bore = param(params, "bore", 12.4);

  // Crankcase — a rounded block, crank axis (Y) through its middle.
  const crankcase = extrudeOn(
    drawRoundedRectangle(96, 80, 16),
    "XZ",
    caseWidth,
  ).translate([0, -caseWidth / 2, 0]);

  // Crankshaft — a main journal along Y with two counterweight discs.
  let crankshaft: Shape3D = makeCylinder(7, caseWidth + 26, [0, -(caseWidth + 26) / 2, 0], [0, 1, 0]);
  for (const y of [-16, 16]) {
    crankshaft = crankshaft.fuse(makeCylinder(17, 12, [0, y - 6, 0], [0, 1, 0]));
  }

  const barrel = makeCylinderBarrel(barrelLength);
  const piston = makeCylinder(bore, 22, [0, 0, 0], [0, 0, 1]);

  const cylinderNode = (index: number, tilt: number) =>
    node({
      name: VTWIN_NODES.cylinder(index),
      shape: barrel,
      position: [0, 0, CYLINDER_BASE_Z] as Vec3,
      rotation: [0, tilt, 0] as Vec3,
      children: [
        node({
          name: VTWIN_NODES.piston(index),
          shape: piston,
          position: [0, 0, 18] as Vec3,
        }),
      ],
    });

  const root = node({
    name: "v-twin",
    children: [
      node({ name: VTWIN_NODES.crankcase, shape: crankcase }),
      node({ name: VTWIN_NODES.crankshaft, shape: crankshaft }),
      cylinderNode(0, V_HALF_ANGLE),
      cylinderNode(1, -V_HALF_ANGLE),
    ],
  });

  return {
    root,
    sliders: [
      { key: "barrelLength", label: "Barrel length (mm)", min: 56, max: 96, step: 1 },
      { key: "caseWidth", label: "Crankcase width (mm)", min: 60, max: 96, step: 1 },
      { key: "bore", label: "Piston radius (mm)", min: 9, max: 16, step: 0.2 },
    ],
  };
}

export const vTwinDefinition: HeroDefinition = {
  id: "v-twin",
  label: "V-Twin Engine",
  defaultParams: { barrelLength: 72, caseWidth: 74, bore: 12.4 },
  build: buildVTwin,
  animate: animateVTwin,
};
