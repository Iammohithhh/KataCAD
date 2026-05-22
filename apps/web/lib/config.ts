// Runtime configuration flags.

/**
 * Booth mode — set `NEXT_PUBLIC_BOOTH_MODE=true` for the exhibition build.
 * It hides the developer-facing status surface so the screen shows only the
 * visitor-facing UI.
 */
export const BOOTH_MODE = process.env.NEXT_PUBLIC_BOOTH_MODE === "true";
