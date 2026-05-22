import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono } from "next/font/google";

import "./globals.css";

// Two families only — Geist for UI, JetBrains Mono for technical data. Both are
// self-hosted (no runtime CDN dependency at the booth).
const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "KatACAD — parametric CAD from natural language",
  description:
    "Describe a part in plain English; KatACAD produces a real, manufacturable engineering model.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
