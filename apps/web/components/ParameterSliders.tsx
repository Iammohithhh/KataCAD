"use client";

// The parameter slider panel — reads the current hero's slider definitions
// and reports changes; the studio rebuilds the hero on each change.
import type { SliderDef } from "@/lib/replicad/heroes";

export interface ParameterSlidersProps {
  sliders: readonly SliderDef[];
  /** Current parameter values, keyed by slider key. */
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
  disabled: boolean;
}

export function ParameterSliders({ sliders, values, onChange, disabled }: ParameterSlidersProps) {
  if (sliders.length === 0) {
    return null;
  }

  return (
    <div className="p-2">
      <p className="mb-1 text-xs font-semibold">Parameters</p>
      <div className="flex flex-col gap-3">
        {sliders.map((slider) => {
          const value = values[slider.key] ?? slider.min;
          return (
            <label key={slider.key} className="flex flex-col text-xs">
              <span>
                {slider.label}: {value}
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
