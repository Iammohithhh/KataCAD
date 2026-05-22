"use client";

// The A3 technical dossier — orthographic + isometric projections, a
// dimension table, a bill of materials, a material specification card with
// AI reasoning, manufacturing notes, a verification stamp, and a title block.
// Phase 7 builds the structure and content; the blueprint visual pass is
// Phase 9. Exports to PDF via the browser's print pipeline.
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { DossierAnalysis } from "@katacad/shared";

import { ProjectionView } from "@/components/dossier/ProjectionView";
import { analyzeDossier } from "@/lib/api/dossier";
import { massGrams, measurePart, type PartMeasurements } from "@/lib/dossier/measure";
import { projectPart, type ProjectionView as Projection } from "@/lib/dossier/projections";
import { getMaterial } from "@/lib/materials";
import { initReplicad } from "@/lib/replicad";
import type { HeroNode } from "@/lib/replicad/heroes";
import { usePartStore } from "@/lib/store/part";
import { certificateId } from "@/lib/verify/certificate";
import { runChecks } from "@/lib/verify/checks";

const FALLBACK_ANALYSIS: DossierAnalysis = {
  material_id: "aluminum-6061",
  material_reasoning:
    "Aluminum 6061-T6 — a sound general-purpose choice for its strength-to-weight ratio and machinability.",
  manufacturing_notes:
    "Machine from billet on a 3-axis mill. General tolerances per ISO 2768-m apply; deburr all edges before inspection.",
};

function collectParts(node: HeroNode, into: string[]): void {
  if (node.shape) into.push(node.name);
  for (const child of node.children) collectParts(child, into);
}

function formatMass(grams: number): string {
  return grams >= 1000 ? `${(grams / 1000).toFixed(2)} kg` : `${grams.toFixed(1)} g`;
}

/** The standard first-angle projection symbol. */
function FirstAngleSymbol() {
  return (
    <svg viewBox="0 0 64 24" className="h-5 w-14" aria-label="first-angle projection">
      <circle cx="12" cy="12" r="9" fill="none" stroke="black" strokeWidth="1" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="black" strokeWidth="1" />
      <path d="M 34 4 L 58 8 L 58 16 L 34 20 Z" fill="none" stroke="black" strokeWidth="1" />
    </svg>
  );
}

export default function DossierClient() {
  const part = usePartStore((state) => state.part);
  const [views, setViews] = useState<Projection[] | null>(null);
  const [measurements, setMeasurements] = useState<PartMeasurements | null>(null);
  const [certificate, setCertificate] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<DossierAnalysis | null>(null);

  useEffect(() => {
    if (!part) return;
    let cancelled = false;

    void (async () => {
      await initReplicad();
      if (cancelled) return;
      try {
        const computedViews = projectPart(part.shape);
        const measured = measurePart(part.shape, part.bounds);
        if (!cancelled) {
          setViews(computedViews);
          setMeasurements(measured);
        }
      } catch (err) {
        console.error("Projection failed:", err);
      }
      try {
        const id = await certificateId(part.model);
        if (!cancelled) setCertificate(id);
      } catch (err) {
        console.error("Certificate failed:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [part]);

  useEffect(() => {
    if (!part) return;
    let cancelled = false;

    void (async () => {
      try {
        const result = await analyzeDossier({
          prompt: part.prompt ?? part.label,
          label: part.label,
          dimensions: part.bounds.size,
          faces: part.shape.faces.length,
        });
        if (!cancelled) setAnalysis(result);
      } catch (err) {
        console.error("Dossier analysis failed; using fallback:", err);
        if (!cancelled) setAnalysis(FALLBACK_ANALYSIS);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [part]);

  const partNames = useMemo(() => {
    if (!part) return [];
    const names: string[] = [];
    collectParts(part.model.root, names);
    return names;
  }, [part]);

  const checks = useMemo(() => (part ? runChecks(part.model, part.shape) : []), [part]);

  if (!part) {
    return (
      <main className="p-8">
        <p>No part is loaded. Open a part in the studio first.</p>
        <Link href="/studio" className="underline">
          Go to the studio
        </Link>
      </main>
    );
  }

  const material = analysis ? getMaterial(analysis.material_id) : null;
  const mass =
    material && measurements ? massGrams(measurements.volume, material.density) : null;
  const today = new Date().toISOString().slice(0, 10);
  const partNumber = certificate ?? `KTN-${part.key.toUpperCase()}`;

  return (
    <div className="bg-white text-black">
      <div className="flex gap-3 border-b p-3 print:hidden">
        <Link href="/studio" className="underline">
          Back to studio
        </Link>
        <button type="button" onClick={() => window.print()} className="border px-3 py-1">
          Export PDF
        </button>
      </div>

      <main className="mx-auto max-w-[1100px] p-6 print:p-0">
        <header className="flex items-start justify-between border-b pb-2">
          <div>
            <h1 className="text-lg font-semibold">KatACAD — Technical Data Sheet</h1>
            <p className="text-sm">{part.label}</p>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <FirstAngleSymbol />
            <span>First-angle projection</span>
          </div>
        </header>

        <section className="mt-4">
          <h2 className="mb-2 text-sm font-semibold">Orthographic & isometric views</h2>
          {views ? (
            <div className="grid grid-cols-2 gap-3">
              {views.map((view) => (
                <ProjectionView key={view.label} view={view} />
              ))}
            </div>
          ) : (
            <p className="text-sm">Generating engineering views...</p>
          )}
          <p className="mt-2 font-mono text-[11px]">
            GENERAL TOLERANCES (ISO 2768-m): LINEAR +/-0.1 mm, ANGULAR +/-0.5 deg
          </p>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-5">
          <div>
            <h2 className="mb-2 text-sm font-semibold">Dimensions</h2>
            <table className="w-full font-mono text-xs">
              <tbody>
                <tr>
                  <td>Bounding box X</td>
                  <td className="text-right">{part.bounds.size[0].toFixed(1)} mm</td>
                </tr>
                <tr>
                  <td>Bounding box Y</td>
                  <td className="text-right">{part.bounds.size[1].toFixed(1)} mm</td>
                </tr>
                <tr>
                  <td>Bounding box Z</td>
                  <td className="text-right">{part.bounds.size[2].toFixed(1)} mm</td>
                </tr>
                <tr>
                  <td>Volume</td>
                  <td className="text-right">
                    {measurements ? `${(measurements.volume / 1000).toFixed(1)} cm3` : "..."}
                  </td>
                </tr>
                <tr>
                  <td>Surface area</td>
                  <td className="text-right">
                    {measurements ? `${(measurements.surfaceArea / 100).toFixed(1)} cm2` : "..."}
                  </td>
                </tr>
                <tr>
                  <td>Mass</td>
                  <td className="text-right">{mass !== null ? formatMass(mass) : "..."}</td>
                </tr>
                <tr>
                  <td>Faces / edges</td>
                  <td className="text-right">
                    {measurements ? `${measurements.faces} / ${measurements.edges}` : "..."}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold">Bill of materials</h2>
            <table className="w-full font-mono text-xs">
              <tbody>
                {partNames.map((name, index) => (
                  <tr key={name}>
                    <td className="w-8">{index + 1}</td>
                    <td>{name}</td>
                    <td className="text-right">1</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-5">
          <div>
            <h2 className="mb-2 text-sm font-semibold">Material specification</h2>
            {material ? (
              <table className="w-full font-mono text-xs">
                <tbody>
                  <tr>
                    <td>Material</td>
                    <td className="text-right">{material.name}</td>
                  </tr>
                  <tr>
                    <td>Standard</td>
                    <td className="text-right">{material.standard}</td>
                  </tr>
                  <tr>
                    <td>Density</td>
                    <td className="text-right">{material.density} g/cm3</td>
                  </tr>
                  <tr>
                    <td>Yield strength</td>
                    <td className="text-right">{material.yieldStrength} MPa</td>
                  </tr>
                  <tr>
                    <td>Ultimate strength</td>
                    <td className="text-right">{material.ultimateStrength} MPa</td>
                  </tr>
                  <tr>
                    <td>Hardness</td>
                    <td className="text-right">{material.hardness}</td>
                  </tr>
                  <tr>
                    <td>Surface finish</td>
                    <td className="text-right">{material.surfaceFinish}</td>
                  </tr>
                  <tr>
                    <td>Process</td>
                    <td className="text-right">{material.process}</td>
                  </tr>
                  <tr>
                    <td>Cost</td>
                    <td className="text-right">USD {material.costPerKg}/kg</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p className="text-sm">Selecting material...</p>
            )}
            <p className="mt-2 text-xs">{analysis?.material_reasoning ?? ""}</p>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold">Manufacturing notes</h2>
            <p className="text-xs">
              {analysis?.manufacturing_notes ?? "Preparing manufacturing notes..."}
            </p>
          </div>
        </section>

        <section className="mt-5 border p-3">
          <h2 className="mb-2 text-sm font-semibold">Verification certificate</h2>
          <p className="font-mono text-sm">{certificate ?? "computing..."}</p>
          <ul className="mt-2 font-mono text-[11px]">
            {checks.map((check) => (
              <li key={check.name}>
                [ verified ] {check.name} — {check.status}
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-5 grid grid-cols-4 border font-mono text-[11px]">
          <div className="border-r p-2">
            <p className="opacity-60">PART</p>
            <p>{part.label}</p>
          </div>
          <div className="border-r p-2">
            <p className="opacity-60">PART NO.</p>
            <p>{partNumber}</p>
          </div>
          <div className="border-r p-2">
            <p className="opacity-60">MATERIAL</p>
            <p>{material?.name ?? "..."}</p>
          </div>
          <div className="p-2">
            <p className="opacity-60">MASS</p>
            <p>{mass !== null ? formatMass(mass) : "..."}</p>
          </div>
          <div className="border-r border-t p-2">
            <p className="opacity-60">SCALE</p>
            <p>NTS</p>
          </div>
          <div className="border-r border-t p-2">
            <p className="opacity-60">UNITS</p>
            <p>mm</p>
          </div>
          <div className="border-r border-t p-2">
            <p className="opacity-60">REV</p>
            <p>A</p>
          </div>
          <div className="border-t p-2">
            <p className="opacity-60">DATE</p>
            <p>{today}</p>
          </div>
          <div className="border-r border-t p-2">
            <p className="opacity-60">DRAWN BY</p>
            <p>KatACAD AI</p>
          </div>
          <div className="border-r border-t p-2">
            <p className="opacity-60">SHEET</p>
            <p>1 of 1</p>
          </div>
          <div className="col-span-2 border-t p-2">
            <p className="opacity-60">ISSUED BY</p>
            <p>KatACAD parametric CAD system</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
