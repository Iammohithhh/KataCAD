// Client for the prompt router (POST /api/route).
import type { RouteResponse } from "@katacad/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// The prompt-to-render budget is ~4s. If the router has not answered within
// this window we abort and let the caller fall back to a default hero.
const ROUTE_TIMEOUT_MS = 3500;

/**
 * Classify a prompt via the router. Rejects on network error, a non-2xx
 * response, or a timeout — the caller is expected to fall back to a hero.
 */
export async function routePrompt(prompt: string): Promise<RouteResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ROUTE_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}/api/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Route request failed: ${res.status}`);
    }
    return (await res.json()) as RouteResponse;
  } finally {
    clearTimeout(timer);
  }
}
