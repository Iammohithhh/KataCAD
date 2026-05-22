// Verification certificate — a stable id derived from the feature tree.
import type { HeroModel, HeroNode } from "@/lib/replicad/heroes";

function collectNames(node: HeroNode, into: string[]): void {
  into.push(node.name);
  for (const child of node.children) {
    collectNames(child, into);
  }
}

/**
 * Hash the feature tree into a `KTN-2026-MM-XXXX` certificate id. The id is
 * stable for the same part (same feature tree) across reloads.
 */
export async function certificateId(model: HeroModel): Promise<string> {
  const names: string[] = [];
  collectNames(model.root, names);

  const bytes = new TextEncoder().encode(names.join("|"));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  return `KTN-2026-${month}-${hex.slice(0, 4).toUpperCase()}`;
}
