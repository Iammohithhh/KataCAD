"use client";

// The parameter slider panel — reads the current part's slider definitions
// and reports changes; the studio rebuilds the part on each change.
import type { SliderDef } from "@/lib/replicad/heroes";

export interface ParameterSlidersProps {
  sliders: readonly SliderDef[];
  /** Current parameter values, keyed by slider key. */
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
  disabled: boolean;
}

function formatValue(value: number, step: number): string {
  if (Number.isInteger(step) && Number.isInteger(value)) return String(value);
  const decimals = step < 1 ? Math.max(1, String(step).split(".")[1]?.length ?? 1) : 1;
  return value.toFixed(decimals);
}

export function ParameterSliders({
  sliders,
  values,
  onChange,
  disabled,
}: ParameterSlidersProps) {
  if (sliders.length === 0) return null;

  return (
    <div className="p-3">
      <p className="mb-2.5 font-mono text-2xs uppercase tracking-[0.14em] text-ink-faint">
        Parameters · {String(sliders.length).padStart(2, "0")}
      </p>
      <div className="flex flex-col gap-3.5">
        {sliders.map((slider) => {
          const value = values[slider.key] ?? slider.min;
          return (
            <label key={slider.key} className="flex flex-col gap-1.5">
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-2xs text-ink-soft">{slider.label}</span>
                <span className="font-mono text-2xs text-ink">
                  {formatValue(value, slider.step)}
                </span>
              </span>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(slider.key, Number(event.target.value))}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
