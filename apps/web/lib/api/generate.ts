// Client for the Layer 2 archetype generator (POST /api/generate/layer2).
import type { GenerateRequest, GenerateResponse } from "@katacad/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// CadQuery generation plus STEP export takes longer than a router call;
// allow a generous ceiling before giving up.
const GENERATE_TIMEOUT_MS = 9000;

/**
 * Generate a Layer 2 archetype. Rejects on network error, a non-2xx response,
 * or a timeout — the caller is expected to fall back.
 */
export async function generateLayer2(request: GenerateRequest): Promise<GenerateResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GENERATE_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}/api/generate/layer2`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Layer 2 generation failed: ${res.status}`);
    }
    return (await res.json()) as GenerateResponse;
  } finally {
    clearTimeout(timer);
  }
}
