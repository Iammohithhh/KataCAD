"use client";

// The engineering specification sheet — the left dock of the studio. It gives
// the part an instrument read-out: a numbered component breakdown, key
// geometric specifications, and standards conformance. While a prompt is
// generating it shows a streaming skeleton, so the spec is in place before the
// 3D part settles into the viewport.
import { toEngineeringLabel } from "@/lib/nomenclature";
import type { HeroBounds, HeroNode } from "@/lib/replicad/heroes";

export interface SpecSheetData {
  label: string;
  partId: string;
  root: HeroNode;
  bounds: HeroBounds;
  faceCount: number;
  edgeCount: number;
}

export interface SpecSheetProps {
  data: SpecSheetData | null;
  generating: boolean;
}

/** Depth-first list of every component below the assembly root. */
function collectComponents(root: HeroNode): string[] {
  const names: string[] = [];
  const walk = (node: HeroNode): void => {
    for (const child of node.children) {
      names.push(child.name);
      walk(child);
    }
  };
  walk(root);
  return names;
}

function countNodes(node: HeroNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 font-mono text-2xs uppercase tracking-[0.14em] text-ink-faint">
      {children}
    </p>
  );
}

function SkeletonBlock() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="skeleton h-9 w-full rounded" />
      <div className="flex flex-col gap-2">
        <div className="skeleton h-3 w-24 rounded-sm" />
        <div className="skeleton h-5 w-full rounded-sm" />
        <div className="skeleton h-5 w-full rounded-sm" />
        <div className="skeleton h-5 w-4/5 rounded-sm" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="skeleton h-3 w-20 rounded-sm" />
        <div className="skeleton h-5 w-full rounded-sm" />
        <div className="skeleton h-5 w-full rounded-sm" />
      </div>
    </div>
  );
}

const STANDARDS = [
  "ISO 2768-m general tolerances",
  "Watertight manifold B-Rep solid",
  "STEP AP242 export conformant",
];

export function SpecSheet({ data, generating }: SpecSheetProps) {
  if (generating || !data) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-line px-4 py-3">
          <p className="font-mono text-2xs uppercase tracking-[0.14em] text-ink-faint">
            Specification
          </p>
        </div>
        <SkeletonBlock />
      </div>
    );
  }

  const components = collectComponents(data.root);
  const features = countNodes(data.root);
  const [sx, sy, sz] = data.bounds.size;

  return (
    <div className="flex h-full animate-dock-in flex-col">
      {/* Header. */}
      <div className="border-b border-line px-4 py-3">
        <p className="font-mono text-2xs uppercase tracking-[0.14em] text-ink-faint">
          Specification
        </p>
        <p className="mt-1.5 truncate text-sm font-semibold text-ink">{data.label}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="truncate font-mono text-2xs text-ink-muted">
            {data.partId}
          </span>
          <span className="ml-auto shrink-0 rounded-sm bg-lavender px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-royal-deep">
            In spec
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Component breakdown. */}
        <div className="border-b border-line px-4 py-4">
          <SectionTitle>
            Components · {String(components.length).padStart(2, "0")}
          </SectionTitle>
          <ol className="flex flex-col gap-px">
            {components.map((name, index) => (
              <li
                key={name}
                className="flex items-center gap-2.5 rounded-sm py-1 font-mono text-2xs"
              >
                <span className="text-ink-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-ink-soft">
                  {toEngineeringLabel(name)}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Key specifications. */}
        <div className="border-b border-line px-4 py-4">
          <SectionTitle>Key specifications</SectionTitle>
          <dl className="flex flex-col gap-1.5 font-mono text-2xs">
            <SpecRow label="Envelope X" value={`${sx.toFixed(1)} mm`} />
            <SpecRow label="Envelope Y" value={`${sy.toFixed(1)} mm`} />
            <SpecRow label="Envelope Z" value={`${sz.toFixed(1)} mm`} />
            <SpecRow label="Feature count" value={String(features)} />
            <SpecRow label="B-Rep faces" value={String(data.faceCount)} />
            <SpecRow label="B-Rep edges" value={String(data.edgeCount)} />
          </dl>
        </div>

        {/* Standards conformance. */}
        <div className="px-4 py-4">
          <SectionTitle>Standards conformance</SectionTitle>
          <ul className="flex flex-col gap-2">
            {STANDARDS.map((standard) => (
              <li key={standard} className="flex items-start gap-2 text-2xs text-ink-soft">
                <svg
                  viewBox="0 0 12 12"
                  className="mt-px h-3 w-3 shrink-0 text-royal"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2.5 6.2 L5 8.6 L9.5 3.4" />
                </svg>
                <span>{standard}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
