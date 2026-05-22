"use client";

// The feature tree — renders the current part's scene graph as a collapsible
// list of engineering-nomenclature node identifiers. Clicking a node selects
// it; the viewport highlights the matching component.
import { useState } from "react";

import { toEngineeringLabel } from "@/lib/nomenclature";
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
        className={`group flex items-center gap-1 rounded-sm py-1 pr-2 font-mono text-2xs transition ${
          isSelected ? "bg-lavender text-royal-deep" : "text-ink-soft hover:bg-paper"
        }`}
        style={{ paddingLeft: depth * 13 + 4 }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Collapse" : "Expand"}
            className="flex h-4 w-4 items-center justify-center text-ink-faint transition hover:text-ink"
          >
            <svg
              viewBox="0 0 12 12"
              className={`h-2.5 w-2.5 transition ${open ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.5 2.5 L8.5 6 L4.5 9.5" />
            </svg>
          </button>
        ) : (
          <span className="flex h-4 w-4 items-center justify-center text-ink-faint">
            <span className="h-1 w-1 rounded-full bg-current" />
          </span>
        )}
        <button
          type="button"
          onClick={() => onSelectNode(node.name)}
          className="truncate text-left"
        >
          {toEngineeringLabel(node.name)}
        </button>
        <span className="ml-auto pl-2 tracking-tight">
          <span className="text-ink-faint">[</span>
          <span className={isSelected ? "text-azure" : "text-royal"}>●</span>
          <span className="text-ink-faint">]</span>
        </span>
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
    <div className="p-3">
      <p className="mb-2 font-mono text-2xs uppercase tracking-[0.14em] text-ink-faint">
        Feature Tree
      </p>
      <TreeRow depth={0} node={root} selectedNode={selectedNode} onSelectNode={onSelectNode} />
    </div>
  );
}
