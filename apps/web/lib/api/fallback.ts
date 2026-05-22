// The router fallback chain — turns an unreliable network into a demo that
// never breaks: cached prompt -> live API -> keyword classifier -> default
// hero. `routeWithFallback` always resolves; it never throws.
import type { RouteResponse } from "@katacad/shared";

import { cacheRoute, getCachedRoute } from "@/lib/cache/promptCache";
import { classifyByKeywords } from "@/lib/router/keywords";

import { routePrompt } from "./route";

const DEFAULT_ROUTE: RouteResponse = {
  layer: 1,
  hero: "gearbox",
  archetype: null,
  params: {},
  source: "fallback",
};

/**
 * Classify a prompt with graceful degradation:
 *  1. a cached classification (instant; survives an API outage),
 *  2. the live router API,
 *  3. the offline keyword classifier,
 *  4. the default hero.
 */
export async function routeWithFallback(prompt: string): Promise<RouteResponse> {
  const cached = getCachedRoute(prompt);
  if (cached) return cached;

  try {
    const live = await routePrompt(prompt);
    cacheRoute(prompt, live);
    return live;
  } catch (err) {
    console.error("Router API unreachable; falling back locally:", err);
  }

  const keyword = classifyByKeywords(prompt);
  if (keyword) return keyword;

  return DEFAULT_ROUTE;
}
