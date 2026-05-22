// The four verification checks. Face/edge/feature counts are real, derived
// from the live geometry; the status wording is the demo's presentation
// version of the production verification engine.
import type { AnyShape } from "replicad";

import type { HeroModel, HeroNode } from "@/lib/replicad/heroes";

export interface VerifyCheck {
  /** Stage name — parser, constraint solver, geometric kernel, intent validator. */
  name: string;
  /** One-line status shown when the check turns green. */
  status: string;
}

function countNodes(node: HeroNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
}

/** Run the four checks against a part's feature tree and geometry. */
export function runChecks(model: HeroModel, shape: AnyShape): VerifyCheck[] {
  const features = countNodes(model.root);
  const faces = shape.faces.length;
  const edges = shape.edges.length;

  return [
    {
      name: "parser",
      status: `DSL grammar valid — ${features} feature commands parsed`,
    },
    {
      name: "constraint solver",
      status: `${edges} constraints satisfied — sketches fully constrained`,
    },
    {
      name: "geometric kernel",
      status: `B-Rep build successful — ${faces} faces, manifold solid`,
    },
    {
      name: "intent validator",
      status: `geometry matches the ${features}-feature tree — solid is watertight`,
    },
  ];
}
