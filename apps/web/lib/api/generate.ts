// Client for the part generators — Layer 2 (archetype) and Layer 3 (retrieval).
import type { GenerateRequest, GenerateResponse, Layer3Request } from "@katacad/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// CadQuery generation takes longer than a router call. Layer 3's first call
// also loads the CLIP model server-side, so it gets a more generous ceiling.
const LAYER2_TIMEOUT_MS = 9000;
const LAYER3_TIMEOUT_MS = 20000;

async function postGenerate(
  path: string,
  body: unknown,
  timeoutMs: number,
): Promise<GenerateResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Generation failed: ${res.status}`);
    }
    return (await res.json()) as GenerateResponse;
  } finally {
    clearTimeout(timer);
  }
}

/** Generate a Layer 2 archetype (bracket, flange, …). */
export function generateLayer2(request: GenerateRequest): Promise<GenerateResponse> {
  return postGenerate("/api/generate/layer2", request, LAYER2_TIMEOUT_MS);
}

/** Retrieve and re-execute a Layer 3 part for an exotic prompt. */
export function generateLayer3(request: Layer3Request): Promise<GenerateResponse> {
  return postGenerate("/api/generate/layer3", request, LAYER3_TIMEOUT_MS);
}
