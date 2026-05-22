"use client";

// Section view control — SolidWorks-style X/Y/Z clipping planes for the
// viewport. Picking an axis cuts the part with a plane; the slider drives the
// plane along that axis. Picking the active axis again clears the section.

export type SectionAxis = "x" | "y" | "z";

export interface SectionState {
  /** Active clipping axis, or null when the part is shown whole. */
  axis: SectionAxis | null;
  /** Plane position along the axis, normalised to [-1, 1]. */
  offset: number;
}

export const NO_SECTION: SectionState = { axis: null, offset: 0 };

const AXES: SectionAxis[] = ["x", "y", "z"];

export interface SectionControlProps {
  value: SectionState;
  onChange: (next: SectionState) => void;
}

export function SectionControl({ value, onChange }: SectionControlProps) {
  const pickAxis = (axis: SectionAxis): void => {
    if (value.axis === axis) {
      onChange(NO_SECTION);
    } else {
      onChange({ axis, offset: 0 });
    }
  };

  return (
    <div className="w-44 rounded-md border border-line bg-surface/95 p-2.5 shadow-raised backdrop-blur">
      <p className="mb-2 font-mono text-2xs uppercase tracking-[0.14em] text-ink-faint">
        Section
      </p>
      <div className="flex gap-1.5">
        {AXES.map((axis) => {
          const active = value.axis === axis;
          return (
            <button
              key={axis}
              type="button"
              onClick={() => pickAxis(axis)}
              aria-pressed={active}
              className={`h-7 flex-1 rounded-sm border font-mono text-xs font-medium uppercase transition ${
                active
                  ? "border-royal bg-royal text-surface"
                  : "border-line-strong bg-surface text-ink-muted hover:border-ink-faint hover:text-ink"
              }`}
            >
              {axis}
            </button>
          );
        })}
      </div>
      {value.axis ? (
        <div className="mt-2.5">
          <input
            type="range"
            min={-1}
            max={1}
            step={0.02}
            value={value.offset}
            onChange={(event) =>
              onChange({ axis: value.axis, offset: Number(event.target.value) })
            }
            aria-label="Section plane position"
          />
        </div>
      ) : null}
    </div>
  );
}
