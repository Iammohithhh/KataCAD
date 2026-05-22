// In-memory cache of router classifications, keyed by the normalized prompt.
//
// Checked before the live API: repeated booth prompts return instantly, and a
// previously-seen prompt still resolves if the API later goes down.
import type { RouteResponse } from "@katacad/shared";

const CACHE = new Map<string, RouteResponse>();
const CACHE_LIMIT = 120;

function normalize(prompt: string): string {
  return prompt.trim().toLowerCase();
}

/** Return a cached classification for a prompt, if one exists. */
export function getCachedRoute(prompt: string): RouteResponse | undefined {
  return CACHE.get(normalize(prompt));
}

/** Cache a classification for a prompt. */
export function cacheRoute(prompt: string, response: RouteResponse): void {
  if (CACHE.size >= CACHE_LIMIT) {
    CACHE.clear();
  }
  CACHE.set(normalize(prompt), response);
}
