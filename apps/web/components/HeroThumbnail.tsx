// Isometric line-art glyphs for the hero gallery — one crafted technical
// drawing per hero. Stroke is `currentColor`, so the gallery card controls the
// colour (ultramarine when active, faint ink otherwise). Zero runtime cost,
// zero network — and more on-brand for an engineering instrument than a photo.
import type { ReactElement } from "react";

import type { HeroId } from "@katacad/shared";

/** Short radial gear teeth, evenly spaced around a circle. */
function teeth(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  count: number,
): ReactElement[] {
  const out: ReactElement[] = [];
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2;
    out.push(
      <line
        key={i}
        x1={cx + rInner * Math.cos(a)}
        y1={cy + rInner * Math.sin(a)}
        x2={cx + rOuter * Math.cos(a)}
        y2={cy + rOuter * Math.sin(a)}
      />,
    );
  }
  return out;
}

const GLYPHS: Record<HeroId, ReactElement> = {
  gearbox: (
    <g>
      {teeth(32, 32, 21, 24.5, 12)}
      <circle cx="32" cy="32" r="21" />
      <circle cx="32" cy="19" r="4.6" />
      <circle cx="43.3" cy="38.5" r="4.6" />
      <circle cx="20.7" cy="38.5" r="4.6" />
      <circle cx="32" cy="32" r="6.6" />
    </g>
  ),
  gripper: (
    <g>
      <circle cx="32" cy="45" r="9" />
      <polyline points="23,37 20,25 19,15" />
      <polyline points="29,37 28,23 27,13" />
      <polyline points="35,37 36,23 37,13" />
      <polyline points="41,37 44,25 45,15" />
      <circle cx="20" cy="25" r="1.7" />
      <circle cx="28" cy="23" r="1.7" />
      <circle cx="36" cy="23" r="1.7" />
      <circle cx="44" cy="25" r="1.7" />
    </g>
  ),
  "robot-arm": (
    <g>
      <line x1="16" y1="54" x2="48" y2="54" />
      <path d="M24 54 L26 46 L38 46 L40 54 Z" />
      <polyline points="32,46 45,31 30,18" />
      <circle cx="32" cy="46" r="3.6" />
      <circle cx="45" cy="31" r="3.2" />
      <circle cx="30" cy="18" r="3.2" />
      <polyline points="30,18 23,11" />
      <polyline points="30,18 33,10" />
    </g>
  ),
  quadcopter: (
    <g>
      <line x1="26" y1="26" x2="16" y2="16" />
      <line x1="38" y1="26" x2="48" y2="16" />
      <line x1="26" y1="38" x2="16" y2="48" />
      <line x1="38" y1="38" x2="48" y2="48" />
      <rect x="26" y="26" width="12" height="12" rx="2.5" />
      <circle cx="14" cy="14" r="8.5" />
      <circle cx="50" cy="14" r="8.5" />
      <circle cx="14" cy="50" r="8.5" />
      <circle cx="50" cy="50" r="8.5" />
    </g>
  ),
  "v-twin": (
    <g>
      <circle cx="32" cy="47" r="8.5" />
      <rect
        x="24"
        y="11"
        width="16"
        height="28"
        rx="3"
        transform="rotate(-24 32 43)"
      />
      <rect
        x="24"
        y="11"
        width="16"
        height="28"
        rx="3"
        transform="rotate(24 32 43)"
      />
      <line x1="14" y1="55" x2="50" y2="55" />
      <circle cx="32" cy="47" r="2.4" />
    </g>
  ),
  differential: (
    <g>
      {teeth(32, 32, 19, 22.5, 12)}
      <circle cx="32" cy="32" r="19" />
      <line x1="32" y1="6" x2="32" y2="58" />
      <circle cx="32" cy="16" r="5" />
      <circle cx="32" cy="48" r="5" />
      <circle cx="32" cy="32" r="6.5" />
    </g>
  ),
  bicycle: (
    <g>
      <circle cx="17" cy="44" r="12" />
      <circle cx="47" cy="44" r="12" />
      <circle cx="17" cy="44" r="2" />
      <circle cx="47" cy="44" r="2" />
      <path d="M17 44 L30 46 L28 22 L17 44 M28 22 L43 20 L30 46 M43 20 L47 44" />
      <polyline points="26,19 32,19" />
      <polyline points="40,20 47,16 50,18" />
    </g>
  ),
  "nema-mount": (
    <g>
      <rect x="14" y="14" width="36" height="36" rx="2.5" />
      <line x1="50" y1="14" x2="56" y2="20" />
      <line x1="50" y1="50" x2="56" y2="56" />
      <line x1="14" y1="50" x2="20" y2="56" />
      <path d="M56 20 L56 56 L20 56" />
      <circle cx="32" cy="32" r="8" />
      <circle cx="32" cy="32" r="12.5" />
      <circle cx="21.5" cy="21.5" r="2.6" />
      <circle cx="42.5" cy="21.5" r="2.6" />
      <circle cx="21.5" cy="42.5" r="2.6" />
      <circle cx="42.5" cy="42.5" r="2.6" />
    </g>
  ),
};

export interface HeroThumbnailProps {
  id: HeroId;
  className?: string;
}

export function HeroThumbnail({ id, className = "" }: HeroThumbnailProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {GLYPHS[id]}
    </svg>
  );
}
