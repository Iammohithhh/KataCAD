// Client for the dossier analysis endpoint (POST /api/dossier/analysis).
import type { DossierAnalysis, DossierRequest } from "@katacad/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Two OpenAI calls server-side; the first also loads the model. Generous.
const TIMEOUT_MS = 16000;

/**
 * Analyze a part for its dossier — material selection + manufacturing notes.
 * Rejects on network error or timeout; the caller falls back.
 */
export async function analyzeDossier(request: DossierRequest): Promise<DossierAnalysis> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}/api/dossier/analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Dossier analysis failed: ${res.status}`);
    }
    return (await res.json()) as DossierAnalysis;
  } finally {
    clearTimeout(timer);
  }
}
