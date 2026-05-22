import type { Config } from "tailwindcss";

// Phase 9 — the locked KatACAD design tokens (Royal Blue identity).
//
// This file and `lib/theme.ts` (the 3D viewport palette) are the only places a
// colour literal may live. Every component consumes the tokens below.

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // The accent — Royal Blue.
        royal: {
          DEFAULT: "#0056FF",
          hover: "#0049DB",
          deep: "#0039AB",
        },
        // The bright/secondary blue — hover states, 3D selection highlight.
        azure: {
          DEFAULT: "#2277FF",
          soft: "#D6E6FF",
        },
        // Soft tint — active cards, hover fills, chips.
        lavender: "#E3E7FC",
        // Text hierarchy.
        ink: {
          DEFAULT: "#0B0D12",
          soft: "#3C414C",
          muted: "#6C7280",
          faint: "#A2A8B4",
        },
        // Backgrounds.
        surface: "#FFFFFF",
        paper: "#F5F6FA",
        // Hairline borders.
        line: {
          DEFAULT: "#E5E7EF",
          strong: "#D2D5DF",
        },
        // Dark navy — the generation screen and other dark surfaces.
        midnight: {
          DEFAULT: "#0A1330",
          deep: "#05070F",
        },
      },
      backgroundImage: {
        // Gradient 1 — Futurewave.
        futurewave: "linear-gradient(135deg, #2277FF 0%, #9DC1FF 100%)",
        // Gradient 2 — Midnight Surge.
        "midnight-surge": "linear-gradient(165deg, #0C1A44 0%, #05070F 100%)",
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      fontSize: {
        // Technical-data size — feature tree, dimension tables, certificate IDs.
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.01em" }],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(11,13,18,0.05), 0 1px 1px rgba(11,13,18,0.03)",
        raised:
          "0 2px 4px rgba(11,13,18,0.06), 0 8px 24px -12px rgba(11,13,18,0.20)",
        lifted: "0 14px 44px -18px rgba(11,13,18,0.34)",
        focus: "0 0 0 3px rgba(0,86,255,0.20)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-still": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "panel-in": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "dock-in": {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "check-in": {
          "0%": { opacity: "0", transform: "translateX(-6px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "stamp-in": {
          "0%": { opacity: "0", transform: "scale(1.22) rotate(-3.5deg)" },
          "55%": { opacity: "1" },
          "100%": { opacity: "1", transform: "scale(1) rotate(-3.5deg)" },
        },
        "reveal-draw": {
          "0%": { strokeDashoffset: "var(--dash)" },
          "100%": { strokeDashoffset: "0" },
        },
        "reveal-fade": {
          "0%, 50%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "scan-y": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "12%": { opacity: "1" },
          "88%": { opacity: "1" },
          "100%": { transform: "translateY(900%)", opacity: "0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        spin: {
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.34s cubic-bezier(0.22,0.61,0.36,1) both",
        "fade-in-still": "fade-in-still 0.4s ease both",
        "panel-in": "panel-in 0.26s cubic-bezier(0.22,0.61,0.36,1) both",
        "dock-in": "dock-in 0.3s cubic-bezier(0.22,0.61,0.36,1) both",
        "check-in": "check-in 0.22s cubic-bezier(0.22,0.61,0.36,1) both",
        "stamp-in": "stamp-in 0.42s cubic-bezier(0.22,0.61,0.36,1) both",
        "reveal-draw": "reveal-draw 0.62s cubic-bezier(0.22,0.61,0.36,1) forwards",
        "reveal-fade": "reveal-fade 1.05s ease forwards",
        "scan-y": "scan-y 2.4s cubic-bezier(0.4,0,0.2,1) infinite",
        "pulse-soft": "pulse-soft 1.1s ease-in-out infinite",
        spin: "spin 0.7s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
