"use client";

// Candidate materials for the part — a sortable comparison table that
// replaces the single-material panel in the dossier. The AI's pick is the
// recommendation; the other rows give the customer something to weigh it
// against (cost, density, yield strength, process).
import { useMemo, useState } from "react";

import { getMaterial, MATERIALS, type Material } from "@/lib/materials";

const CURATED_IDS = [
  "aluminum-6061",
  "aluminum-7075",
  "steel-1045",
  "stainless-304",
  "titanium-ti6al4v",
  "acetal-delrin",
] as const;

type SortKey = "density" | "yield" | "cost" | "part";
type SortDir = "asc" | "desc";

interface Row {
  material: Material;
  partCost: number;
}

/** Pick six diverse materials, guaranteeing the recommended one is included. */
function pickRows(recommendedId: string, volumeMm3: number): Row[] {
  const idList: string[] = (CURATED_IDS as readonly string[]).slice();
  if (!idList.includes(recommendedId)) idList.push(recommendedId);

  // If the recommendation pushed the list to seven, drop the curated entry
  // closest in cost to the recommendation (the redundant one).
  const recommended = getMaterial(recommendedId);
  if (idList.length > 6) {
    let dropIndex = -1;
    let dropDelta = Infinity;
    for (let i = 0; i < idList.length; i += 1) {
      const id = idList[i];
      if (id === recommendedId) continue;
      const m = MATERIALS.find((entry) => entry.id === id);
      if (!m) continue;
      const delta = Math.abs(m.costPerKg - recommended.costPerKg);
      if (delta < dropDelta) {
        dropDelta = delta;
        dropIndex = i;
      }
    }
    if (dropIndex >= 0) idList.splice(dropIndex, 1);
  }

  return idList
    .map((id) => MATERIALS.find((m) => m.id === id))
    .filter((m): m is Material => Boolean(m))
    .map((material) => {
      // Mass = volume_cm3 * density (g/cm^3); convert g → kg → cost.
      const massKg = (volumeMm3 / 1000) * material.density * 0.001;
      return { material, partCost: massKg * material.costPerKg };
    });
}

function compareRows(a: Row, b: Row, key: SortKey, dir: SortDir): number {
  const factor = dir === "asc" ? 1 : -1;
  switch (key) {
    case "density":
      return (a.material.density - b.material.density) * factor;
    case "yield":
      return (a.material.yieldStrength - b.material.yieldStrength) * factor;
    case "cost":
      return (a.material.costPerKg - b.material.costPerKg) * factor;
    case "part":
      return (a.partCost - b.partCost) * factor;
  }
}

export interface MaterialsTableProps {
  /** The AI-recommended material id (from the dossier analysis). */
  recommendedId: string;
  /** Part volume in mm^3, used for the per-part cost column. */
  volumeMm3: number;
}

interface SortHeaderProps {
  label: string;
  field: SortKey;
  active: SortKey;
  dir: SortDir;
  onSort: (field: SortKey) => void;
  align?: "left" | "right";
}

function SortHeader({ label, field, active, dir, onSort, align = "right" }: SortHeaderProps) {
  const isActive = active === field;
  return (
    <th className={`px-2 py-1.5 font-mono text-2xs font-medium uppercase tracking-wider ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 transition ${
          isActive ? "text-royal" : "text-ink-muted hover:text-ink"
        }`}
      >
        {label}
        <span className="text-[9px]">{isActive ? (dir === "asc" ? "▲" : "▼") : "↕"}</span>
      </button>
    </th>
  );
}

export function MaterialsTable({ recommendedId, volumeMm3 }: MaterialsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("part");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey): void => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const rows = useMemo(() => pickRows(recommendedId, volumeMm3), [recommendedId, volumeMm3]);
  const sorted = useMemo(
    () => [...rows].sort((a, b) => compareRows(a, b, sortKey, sortDir)),
    [rows, sortKey, sortDir],
  );

  return (
    <div className="overflow-hidden rounded border border-line">
      <table className="w-full border-collapse">
        <thead className="border-b border-line bg-paper">
          <tr>
            <th className="px-2 py-1.5 text-left font-mono text-2xs font-medium uppercase tracking-wider text-ink-muted">
              Material
            </th>
            <SortHeader label="ρ" field="density" active={sortKey} dir={sortDir} onSort={handleSort} />
            <SortHeader label="σy" field="yield" active={sortKey} dir={sortDir} onSort={handleSort} />
            <SortHeader label="$/kg" field="cost" active={sortKey} dir={sortDir} onSort={handleSort} />
            <SortHeader label="Part" field="part" active={sortKey} dir={sortDir} onSort={handleSort} />
            <th className="px-2 py-1.5 text-left font-mono text-2xs font-medium uppercase tracking-wider text-ink-muted">
              Process
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(({ material, partCost }) => {
            const recommended = material.id === recommendedId;
            return (
              <tr
                key={material.id}
                className={`border-b border-line last:border-b-0 font-mono text-2xs ${
                  recommended ? "bg-lavender/60" : "bg-surface"
                }`}
              >
                <td className="px-2 py-1.5 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-ink">{material.name}</span>
                    {recommended ? (
                      <span className="rounded-sm bg-royal px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-surface">
                        Recommended
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[10px] text-ink-faint">{material.standard}</p>
                </td>
                <td className="px-2 py-1.5 text-right text-ink-soft">
                  {material.density.toFixed(2)}
                </td>
                <td className="px-2 py-1.5 text-right text-ink-soft">
                  {material.yieldStrength}
                </td>
                <td className="px-2 py-1.5 text-right text-ink-soft">
                  {material.costPerKg.toFixed(2)}
                </td>
                <td className={`px-2 py-1.5 text-right ${recommended ? "font-medium text-royal-deep" : "text-ink-soft"}`}>
                  ${partCost.toFixed(2)}
                </td>
                <td className="px-2 py-1.5 text-left text-ink-soft">
                  {material.process}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
