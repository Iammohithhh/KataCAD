"use client";

// The hero library — a strip of cards that load Layer 1 heroes directly. Each
// card carries a crafted isometric line-art glyph of its mechanism.
import type { HeroId } from "@katacad/shared";

import { HeroThumbnail } from "@/components/HeroThumbnail";
import { HERO_GALLERY } from "@/lib/replicad/heroes";

export interface HeroGalleryProps {
  activeId: HeroId | null;
  onSelect: (id: HeroId) => void;
  /** Disable every card while the CAD kernel is still loading. */
  disabled: boolean;
}

export function HeroGallery({ activeId, onSelect, disabled }: HeroGalleryProps) {
  return (
    <div className="border-t border-line bg-surface">
      <div className="flex items-stretch gap-2.5 overflow-x-auto px-5 py-3.5">
        <span className="flex shrink-0 items-center pr-1 font-mono text-2xs uppercase tracking-[0.14em] text-ink-faint">
          Library
        </span>

        {disabled
          ? Array.from({ length: HERO_GALLERY.length }).map((_, index) => (
              <div
                key={index}
                className="skeleton h-[74px] w-[108px] shrink-0 rounded-md"
              />
            ))
          : HERO_GALLERY.map((entry) => {
              const active = activeId === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  disabled={!entry.available}
                  aria-pressed={active}
                  onClick={() => onSelect(entry.id)}
                  className={`group flex w-[108px] shrink-0 flex-col items-center gap-1.5 rounded-md border px-2 py-2.5 transition ${
                    active
                      ? "border-royal bg-lavender shadow-panel"
                      : "border-line bg-surface hover:border-ink-faint hover:bg-paper"
                  }`}
                >
                  <HeroThumbnail
                    id={entry.id}
                    className={`h-9 w-9 transition ${
                      active
                        ? "text-royal"
                        : "text-ink-faint group-hover:text-ink-muted"
                    }`}
                  />
                  <span
                    className={`text-center text-[11px] font-medium leading-tight transition ${
                      active ? "text-royal-deep" : "text-ink-soft"
                    }`}
                  >
                    {entry.label}
                  </span>
                </button>
              );
            })}
      </div>
    </div>
  );
}
