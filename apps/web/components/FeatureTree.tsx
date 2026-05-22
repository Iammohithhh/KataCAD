"use client";

// The feature tree — renders the current hero's scene graph as a collapsible
// list of semantic node names. Clicking a node selects it; the viewport
// highlights the matching part.
import { useState } from "react";

import type { HeroNode } from "@/lib/replicad/heroes";

export interface FeatureTreeProps {
  root: HeroNode;
  selectedNode: string | null;
  onSelectNode: (name: string) => void;
}

interface TreeRowProps {
  node: HeroNode;
  depth: number;
  selectedNode: string | null;
  onSelectNode: (name: string) => void;
}

function TreeRow({ node, depth, selectedNode, onSelectNode }: TreeRowProps) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = node.name === selectedNode;

  return (
    <div>
      <div
        className="flex items-center gap-1 font-mono text-xs"
        style={{ paddingLeft: depth * 14 }}
      >
        {hasChildren ? (
          <button type="button" onClick={() => setOpen((v) => !v)} className="w-4">
            {open ? "▾" : "▸"}
          </button>
        ) : (
          <span className="w-4 text-center">·</span>
        )}
        <button
          type="button"
          onClick={() => onSelectNode(node.name)}
          className={isSelected ? "underline" : ""}
        >
          {node.name}
        </button>
      </div>
      {open &&
        node.children.map((child) => (
          <TreeRow
            key={child.name}
            node={child}
            depth={depth + 1}
            selectedNode={selectedNode}
            onSelectNode={onSelectNode}
          />
        ))}
    </div>
  );
}

export function FeatureTree({ root, selectedNode, onSelectNode }: FeatureTreeProps) {
  return (
    <div className="overflow-auto p-2">
      <p className="mb-1 text-xs font-semibold">Feature Tree</p>
      <TreeRow depth={0} node={root} selectedNode={selectedNode} onSelectNode={onSelectNode} />
    </div>
  );
}
