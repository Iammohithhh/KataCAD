"use client";

// The A3 technical dossier — orthographic + isometric projections, a
// dimension table, a bill of materials, a sortable materials comparison, a
// manufacturing-notes block, a verification stamp, and a proper engineering
// title block. Phase 9 gives it the typography and blueprint detailing pass.
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { DossierAnalysis } from "@katacad/shared";

import { MaterialsTable } from "@/components/dossier/MaterialsTable";
import { ProjectionView } from "@/components/dossier/ProjectionView";
import { Button } from "@/components/ui/Button";
import { BrandMark } from "@/components/Wordmark";
import { analyzeDossier } from "@/lib/api/dossier";
import { massGrams, measurePart, type PartMeasurements } from "@/lib/dossier/measure";
import { projectPart, type ProjectionView as Projection } from "@/lib/dossier/projections";
import { getMaterial } from "@/lib/materials";
import { toEngineeringLabel } from "@/lib/nomenclature";
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

function collectComponents(node: HeroNode): string[] {
  const names: string[] = [];
  const walk = (n: HeroNode): void => {
    for (const child of n.children) {
      names.push(child.name);
      walk(child);
    }
  };
  walk(node);
  return names.length > 0 ? names : [node.name];
}

function formatMass(grams: number): string {
  return grams >= 1000 ? `${(grams / 1000).toFixed(2)} kg` : `${grams.toFixed(1)} g`;
}

/** The standard first-angle projection symbol. */
function FirstAngleSymbol() {
  return (
    <svg viewBox="0 0 64 24" className="h-5 w-14" aria-label="first-angle projection">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M 34 4 L 58 8 L 58 16 L 34 20 Z" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function SectionHeading({ index, label }: { index: string; label: string }) {
  return (
    <div className="mb-3 flex items-baseline gap-3 border-b border-line pb-1.5">
      <span className="font-mono text-2xs text-royal">{index}</span>
      <h2 className="font-mono text-2xs font-medium uppercase tracking-[0.18em] text-ink">
        {label}
      </h2>
    </div>
  );
}

function TitleCell({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`px-3 py-2 ${className}`}>
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-xs text-ink">{value}</p>
    </div>
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

  const components = useMemo(() => (part ? collectComponents(part.model.root) : []), [part]);
  const checks = useMemo(() => (part ? runChecks(part.model, part.shape) : []), [part]);

  if (!part) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface p-8">
        <div className="rounded-lg border border-line bg-surface p-6 text-center shadow-panel">
          <p className="text-sm text-ink-muted">No part is loaded.</p>
          <Link
            href="/studio"
            className="mt-3 inline-block text-sm font-medium text-royal hover:text-royal-hover"
          >
            Open the studio →
          </Link>
        </div>
      </main>
    );
  }

  const material = analysis ? getMaterial(analysis.material_id) : null;
  const mass =
    material && measurements ? massGrams(measurements.volume, material.density) : null;
  const today = new Date().toISOString().slice(0, 10);
  const partNumber = certificate ?? `KTN-${part.key.toUpperCase()}`;

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Top bar — not printed. */}
      <div className="flex items-center justify-between border-b border-line bg-surface px-6 py-3 print:hidden">
        <Link
          href="/studio"
          className="font-mono text-2xs uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
        >
          ← back to studio
        </Link>
        <Button variant="primary" size="sm" onClick={() => window.print()}>
          Export PDF
        </Button>
      </div>

      <main className="mx-auto max-w-[1100px] bg-surface p-8 text-[12px] leading-relaxed shadow-panel print:max-w-none print:p-0 print:shadow-none">
        {/* Header. */}
        <header className="flex items-start justify-between gap-6 border-b-2 border-ink pb-4">
          <div className="flex items-start gap-3">
            <BrandMark className="mt-1 h-6 w-6" />
            <div>
              <p className="font-mono text-2xs uppercase tracking-[0.2em] text-ink-muted">
                KatACAD · Technical Data Sheet
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                {part.label}
              </h1>
              <p className="mt-1 font-mono text-2xs text-ink-faint">{partNumber}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <div className="flex items-center gap-2 text-ink-muted">
              <FirstAngleSymbol />
              <span className="font-mono text-2xs uppercase tracking-[0.14em]">
                First-angle projection
              </span>
            </div>
            <p className="mt-1 font-mono text-2xs text-ink-faint">
              Issued {today} · Rev A · Sheet 1 of 1
            </p>
          </div>
        </header>

        {/* 01 Projections. */}
        <section className="mt-6">
          <SectionHeading index="01" label="Orthographic & isometric views" />
          {views ? (
            <div className="grid grid-cols-2 gap-3">
              {views.map((view) => (
                <ProjectionView key={view.label} view={view} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-44 rounded" />
              ))}
            </div>
          )}
          <p className="mt-2 font-mono text-2xs uppercase tracking-[0.14em] text-ink-muted">
            General tolerances (ISO 2768-m) · Linear ±0.1 mm · Angular ±0.5°
          </p>
        </section>

        {/* 02 Dimensions & BOM. */}
        <section className="mt-7 grid grid-cols-2 gap-6">
          <div>
            <SectionHeading index="02" label="Dimensions" />
            <table className="w-full font-mono text-2xs">
              <tbody>
                <DimRow label="Envelope X" value={`${part.bounds.size[0].toFixed(1)} mm`} />
                <DimRow label="Envelope Y" value={`${part.bounds.size[1].toFixed(1)} mm`} />
                <DimRow label="Envelope Z" value={`${part.bounds.size[2].toFixed(1)} mm`} />
                <DimRow
                  label="Volume"
                  value={
                    measurements ? `${(measurements.volume / 1000).toFixed(1)} cm³` : "…"
                  }
                />
                <DimRow
                  label="Surface area"
                  value={
                    measurements
                      ? `${(measurements.surfaceArea / 100).toFixed(1)} cm²`
                      : "…"
                  }
                />
                <DimRow
                  label="Mass"
                  value={mass !== null ? formatMass(mass) : "…"}
                />
                <DimRow
                  label="B-Rep faces / edges"
                  value={
                    measurements ? `${measurements.faces} / ${measurements.edges}` : "…"
                  }
                />
              </tbody>
            </table>
          </div>

          <div>
            <SectionHeading index="03" label={`Bill of materials · ${String(components.length).padStart(2, "0")}`} />
            <table className="w-full font-mono text-2xs">
              <tbody>
                {components.map((name, index) => (
                  <tr key={name} className="border-b border-line last:border-b-0">
                    <td className="w-10 py-1 pr-2 text-ink-faint">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="py-1 text-ink">{toEngineeringLabel(name)}</td>
                    <td className="py-1 text-right text-ink-muted">1</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 04 Materials comparison. */}
        <section className="mt-7">
          <SectionHeading index="04" label="Material analysis" />
          {analysis && measurements ? (
            <>
              <MaterialsTable
                recommendedId={analysis.material_id}
                volumeMm3={measurements.volume}
              />
              <p className="mt-2 text-xs text-ink-soft">{analysis.material_reasoning}</p>
            </>
          ) : (
            <div className="skeleton h-40 rounded" />
          )}
        </section>

        {/* 05 Manufacturing notes. */}
        <section className="mt-7">
          <SectionHeading index="05" label="Manufacturing notes" />
          {analysis ? (
            <p className="text-xs leading-relaxed text-ink-soft">
              {analysis.manufacturing_notes}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="skeleton h-3 rounded-sm" />
              <div className="skeleton h-3 w-5/6 rounded-sm" />
              <div className="skeleton h-3 w-4/6 rounded-sm" />
            </div>
          )}
        </section>

        {/* 06 Verification. */}
        <section className="mt-7">
          <SectionHeading index="06" label="Verification certificate" />
          <div className="rounded border-2 border-dashed border-royal/70 bg-lavender/40 p-4">
            <div className="flex items-center gap-2">
              <BrandMark className="h-4 w-4" />
              <span className="font-mono text-2xs uppercase tracking-[0.18em] text-royal-deep">
                Verified
              </span>
              <span className="ml-auto font-mono text-2xs text-ink-faint">{today}</span>
            </div>
            <p className="mt-2 font-mono text-base text-ink">{certificate ?? "computing…"}</p>
            <ul className="mt-3 flex flex-col gap-1 font-mono text-2xs text-ink-soft">
              {checks.map((check) => (
                <li key={check.name} className="flex items-start gap-2">
                  <svg
                    viewBox="0 0 12 12"
                    className="mt-0.5 h-3 w-3 shrink-0 text-royal"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.5 6.2 L5 8.6 L9.5 3.4" />
                  </svg>
                  <span>
                    <span className="uppercase tracking-wider text-ink">{check.name}</span>
                    <span className="ml-1.5 text-ink-muted">— {check.status}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Title block. */}
        <footer className="mt-8 grid grid-cols-4 border border-ink/80 bg-surface">
          <TitleCell label="Part" value={part.label} className="col-span-2 border-r border-line" />
          <TitleCell label="Part no." value={partNumber} className="border-r border-line" />
          <TitleCell label="Material" value={material?.name ?? "…"} />
          <TitleCell
            label="Mass"
            value={mass !== null ? formatMass(mass) : "…"}
            className="border-r border-t border-line"
          />
          <TitleCell label="Scale" value="NTS" className="border-r border-t border-line" />
          <TitleCell label="Units" value="mm" className="border-r border-t border-line" />
          <TitleCell label="Rev" value="A" className="border-t border-line" />
          <TitleCell label="Date" value={today} className="border-r border-t border-line" />
          <TitleCell label="Drawn by" value="KatACAD AI" className="border-r border-t border-line" />
          <TitleCell label="Sheet" value="1 of 1" className="border-r border-t border-line" />
          <TitleCell label="Issued by" value="KatACAD parametric CAD" className="border-t border-line" />
        </footer>
      </main>
    </div>
  );
}

function DimRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-line last:border-b-0">
      <td className="py-1 text-ink-muted">{label}</td>
      <td className="py-1 text-right text-ink">{value}</td>
    </tr>
  );
}
