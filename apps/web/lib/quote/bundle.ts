// The "quote-ready deliverable" bundle.
//
// One call builds a small zip containing what a machine shop actually wants
// to bid on a part: a CSV bill of materials with vendor SKUs, an RFQ PDF,
// and an inspection report PDF with the critical dimensions called out in
// red. The PDF / ZIP libraries are dynamically imported so they never run
// server-side and never enter the dossier bundle until the visitor clicks.
import type { Material } from "@/lib/materials";
import { toEngineeringLabel } from "@/lib/nomenclature";
import type { HeroBounds } from "@/lib/replicad/heroes";

export interface QuotePackInput {
  partLabel: string;
  partId: string;
  prompt: string | null;
  componentNames: string[];
  material: Material;
  bounds: HeroBounds;
  volumeMm3: number;
  massGrams: number;
  faces: number;
  edges: number;
  certificate: string | null;
  /** Issue date, "YYYY-MM-DD". */
  date: string;
}

/** A short, deterministic hash for stable fake vendor SKUs. */
function hash6(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(h).toString(36).toUpperCase().padStart(5, "0").slice(0, 5);
}

function materialSkuRoot(material: Material): string {
  const slug = material.id.toUpperCase().replace(/[^A-Z0-9]+/g, "-");
  return `KTN-${slug}`;
}

function unitMassKg(volumeMm3: number, material: Material): number {
  return (volumeMm3 / 1000) * material.density * 0.001;
}

function unitCost(volumeMm3: number, material: Material): number {
  return unitMassKg(volumeMm3, material) * material.costPerKg;
}

/** A naive CSV escape — surrounds with quotes if needed, doubles inner quotes. */
function csvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildBomCsv(input: QuotePackInput): string {
  const skuRoot = materialSkuRoot(input.material);
  const components = input.componentNames.length > 0
    ? input.componentNames
    : ["assembly"];
  const unitCostShare = unitCost(input.volumeMm3, input.material) / components.length;

  const header = [
    "Item",
    "Component",
    "Quantity",
    "Material",
    "Standard",
    "Vendor SKU",
    "Process",
    "Unit cost (USD)",
  ];

  const rows = components.map((name, index) => {
    const label = toEngineeringLabel(name);
    const sku = `${skuRoot}-${hash6(`${input.partId}/${label}`)}`;
    return [
      String(index + 1).padStart(2, "0"),
      label,
      1,
      input.material.name,
      input.material.standard,
      sku,
      input.material.process,
      unitCostShare.toFixed(2),
    ];
  });

  const lines = [header, ...rows].map((row) => row.map(csvCell).join(","));
  return `${lines.join("\r\n")}\r\n`;
}

interface PdfHandle {
  text: (s: string, x: number, y: number, opts?: object) => unknown;
  setFontSize: (n: number) => unknown;
  setFont: (family: string, style?: string) => unknown;
  setTextColor: (r: number, g: number, b?: number) => unknown;
  setDrawColor: (r: number, g: number, b?: number) => unknown;
  setLineWidth: (n: number) => unknown;
  line: (x1: number, y1: number, x2: number, y2: number) => unknown;
  rect: (x: number, y: number, w: number, h: number, style?: string) => unknown;
  output: (type: "blob") => Blob;
}

/** Letterhead + dividing line shared by both PDFs. */
function letterhead(doc: PdfHandle, title: string): void {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(11, 13, 18);
  doc.text("KATACAD", 20, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(108, 114, 128);
  doc.text("Parametric CAD · Bangalore, India", 20, 23);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 86, 255);
  doc.text(title, 190, 20, { align: "right" } as object);

  doc.setDrawColor(229, 231, 239);
  doc.setLineWidth(0.4);
  doc.line(20, 28, 190, 28);
}

function infoRow(
  doc: PdfHandle,
  label: string,
  value: string,
  x: number,
  y: number,
): void {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(108, 114, 128);
  doc.text(label.toUpperCase(), x, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(11, 13, 18);
  doc.text(value, x, y + 5);
}

async function buildRfqPdf(input: QuotePackInput): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" }) as unknown as PdfHandle;

  letterhead(doc, "REQUEST FOR QUOTATION");

  infoRow(doc, "Part", input.partLabel, 20, 40);
  infoRow(doc, "Part number", input.partId, 110, 40);
  infoRow(doc, "Date", input.date, 20, 56);
  infoRow(doc, "Quantity (initial)", "10", 110, 56);
  infoRow(doc, "Lead time", "10 working days", 20, 72);
  infoRow(doc, "Delivery", "Incoterms FCA Bangalore", 110, 72);

  // Material block.
  doc.setDrawColor(229, 231, 239);
  doc.line(20, 84, 190, 84);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(11, 13, 18);
  doc.text("MATERIAL", 20, 92);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${input.material.name}  ·  ${input.material.standard}`, 20, 100);
  doc.setFontSize(9);
  doc.setTextColor(60, 65, 76);
  doc.text(
    `Density ${input.material.density} g/cm³   ·   Yield ${input.material.yieldStrength} MPa   ·   ${input.material.process}`,
    20,
    107,
  );

  // Geometry block.
  doc.setDrawColor(229, 231, 239);
  doc.line(20, 115, 190, 115);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(11, 13, 18);
  doc.text("GEOMETRY", 20, 123);

  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 65, 76);
  const [bx, by, bz] = input.bounds.size;
  const lines = [
    `Bounding envelope    ${bx.toFixed(1)} × ${by.toFixed(1)} × ${bz.toFixed(1)} mm`,
    `Volume               ${(input.volumeMm3 / 1000).toFixed(2)} cm³`,
    `Mass (per part)      ${input.massGrams.toFixed(1)} g`,
    `B-Rep complexity     ${input.faces} faces · ${input.edges} edges`,
    `Estimated unit cost  USD ${unitCost(input.volumeMm3, input.material).toFixed(2)}`,
  ];
  lines.forEach((line, index) => doc.text(line, 20, 131 + index * 6));

  // Tolerances + surface finish.
  doc.setDrawColor(229, 231, 239);
  doc.line(20, 168, 190, 168);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(11, 13, 18);
  doc.text("GENERAL TOLERANCES & FINISH", 20, 176);
  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 65, 76);
  doc.text("Linear  ±0.10 mm   Angular  ±0.5°   per ISO 2768-m", 20, 184);
  doc.text(`Surface finish target  ${input.material.surfaceFinish}`, 20, 190);

  // Footer.
  doc.setDrawColor(229, 231, 239);
  doc.line(20, 268, 190, 268);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(162, 168, 180);
  doc.text(
    `Issued by KatACAD parametric CAD system · ${input.certificate ?? input.partId}`,
    20,
    274,
  );

  return doc.output("blob");
}

async function buildInspectionPdf(input: QuotePackInput): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" }) as unknown as PdfHandle;

  letterhead(doc, "INSPECTION REPORT");

  infoRow(doc, "Part", input.partLabel, 20, 40);
  infoRow(doc, "Part number", input.partId, 110, 40);
  infoRow(doc, "Date", input.date, 20, 56);
  infoRow(
    doc,
    "Certificate",
    input.certificate ?? "—",
    110,
    56,
  );

  // Section header.
  doc.setDrawColor(229, 231, 239);
  doc.line(20, 72, 190, 72);

  // Dimensional inspection table header.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(11, 13, 18);
  doc.text("DIMENSIONAL INSPECTION", 20, 80);

  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.setTextColor(108, 114, 128);
  doc.text("Feature             Nominal      Tolerance     Method", 20, 90);
  doc.setDrawColor(229, 231, 239);
  doc.line(20, 92, 190, 92);

  const [bx, by, bz] = input.bounds.size;
  const rows: [string, string, string, string][] = [
    ["Envelope X", `${bx.toFixed(2)} mm`, "±0.10 mm", "CMM"],
    ["Envelope Y", `${by.toFixed(2)} mm`, "±0.10 mm", "CMM"],
    ["Envelope Z", `${bz.toFixed(2)} mm`, "±0.10 mm", "CMM"],
    [
      "Mass",
      `${input.massGrams.toFixed(1)} g`,
      "±5 %",
      "balance",
    ],
    ["Surface finish", input.material.surfaceFinish, "max", "Ra meter"],
  ];

  doc.setTextColor(60, 65, 76);
  rows.forEach((row, index) => {
    const y = 100 + index * 7;
    doc.text(row[0].padEnd(20), 20, y);
    doc.text(row[1].padStart(12), 80, y);
    doc.text(row[2].padStart(13), 120, y);
    doc.text(row[3].padStart(10), 165, y);
  });

  // Critical-dimensions callout in red.
  doc.setDrawColor(229, 231, 239);
  doc.line(20, 150, 190, 150);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(192, 32, 32);
  doc.text("CRITICAL DIMENSIONS  ·  100% inspection required", 20, 158);

  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  const critical = [bx, by, bz]
    .map((v, i) => ({ axis: "XYZ"[i], value: v }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
  critical.forEach((c, index) => {
    doc.text(
      `[${c.axis}]   ${c.value.toFixed(2)} mm   ±0.05 mm   CMM`,
      20,
      168 + index * 6,
    );
  });

  // Sign-off.
  doc.setTextColor(11, 13, 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("INSPECTOR SIGN-OFF", 20, 220);
  doc.setDrawColor(180, 184, 195);
  doc.setLineWidth(0.3);
  doc.line(20, 235, 90, 235);
  doc.line(110, 235, 180, 235);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(108, 114, 128);
  doc.text("Inspector", 20, 240);
  doc.text("Date", 110, 240);

  // Footer.
  doc.setDrawColor(229, 231, 239);
  doc.line(20, 268, 190, 268);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(162, 168, 180);
  doc.text(
    `KatACAD parametric CAD system  ·  ${input.partId}`,
    20,
    274,
  );

  return doc.output("blob");
}

function buildReadme(input: QuotePackInput): string {
  return [
    "KATACAD — QUOTE PACK",
    "",
    `Part:         ${input.partLabel}`,
    `Part number:  ${input.partId}`,
    `Date:         ${input.date}`,
    "",
    "Contents:",
    "  BOM.csv          Bill of materials with vendor SKUs",
    "  RFQ.pdf          Request for quotation",
    "  inspection.pdf   Inspection report (critical dimensions called out)",
    "",
    "Issued by the KatACAD parametric CAD system.",
    "",
  ].join("\r\n");
}

/** Build the zip blob. Returns a Blob the caller can hand to downloadBlob. */
export async function buildQuotePack(input: QuotePackInput): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  zip.file("BOM.csv", buildBomCsv(input));
  zip.file("RFQ.pdf", await buildRfqPdf(input));
  zip.file("inspection.pdf", await buildInspectionPdf(input));
  zip.file("README.txt", buildReadme(input));

  return zip.generateAsync({ type: "blob" });
}
