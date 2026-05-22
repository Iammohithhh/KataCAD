"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/Wordmark";

export default function HomePage() {
  const [pingResponse, setPingResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const pingApi = async (): Promise<void> => {
    setLoading(true);
    setPingResponse("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/echo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "hello from web" }),
      });
      const data = await res.json();
      setPingResponse(JSON.stringify(data));
    } catch (err) {
      setPingResponse(`error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <header className="flex items-center border-b border-line px-6 py-3">
        <Wordmark />
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center gap-6 px-6 py-12">
        <p className="font-mono text-2xs uppercase tracking-[0.2em] text-royal">
          Parametric CAD · Natural language
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          Engineering models, described in plain English.
        </h1>
        <p className="max-w-xl text-base text-ink-soft">
          KatACAD turns a sentence into a verified, manufacturable mechanical
          part — real B-Rep geometry, real STEP export, real technical dossier.
        </p>
        <div className="flex items-center gap-3">
          <Link href="/studio">
            <Button variant="primary" size="md">
              Open the studio →
            </Button>
          </Link>
          <Link href="/playground">
            <Button variant="ghost" size="md">
              Phase 1 playground
            </Button>
          </Link>
        </div>
      </section>

      <footer className="flex items-center justify-between border-t border-line bg-paper/70 px-6 py-3 font-mono text-2xs uppercase tracking-[0.14em] text-ink-faint">
        <span>KatACAD · exhibition demo</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={pingApi}
            disabled={loading}
            className="text-ink-muted transition hover:text-ink disabled:opacity-50"
          >
            {loading ? "pinging…" : "ping api"}
          </button>
          {pingResponse ? (
            <span className="hidden text-ink md:inline">{pingResponse}</span>
          ) : null}
        </div>
      </footer>
    </main>
  );
}
