"use client";

// The hero gallery — a strip of buttons that load Layer 1 heroes directly.
// Three are live (Phase 2); the other five are disabled placeholders.
import type { HeroId } from "@katacad/shared";

import { HERO_GALLERY } from "@/lib/replicad/heroes";

export interface HeroGalleryProps {
  activeId: HeroId | null;
  onSelect: (id: HeroId) => void;
  /** Disable every button while the CAD kernel is still loading. */
  disabled: boolean;
}

export function HeroGallery({ activeId, onSelect, disabled }: HeroGalleryProps) {
  return (
    <div className="flex gap-2 overflow-x-auto border-t p-3">
      {HERO_GALLERY.map((entry) => (
        <button
          key={entry.id}
          type="button"
          disabled={!entry.available || disabled}
          aria-pressed={activeId === entry.id}
          onClick={() => onSelect(entry.id)}
          className="whitespace-nowrap border px-3 py-2 text-sm"
        >
          {activeId === entry.id ? "▶ " : ""}
          {entry.label}
          {entry.available ? "" : " (soon)"}
        </button>
      ))}
    </div>
  );
}
