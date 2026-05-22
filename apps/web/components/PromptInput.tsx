"use client";

// The prompt box. The visitor types a part description and submits; the studio
// routes it and loads the matching part.
import { useState } from "react";

import { Button } from "@/components/ui/Button";

export interface PromptInputProps {
  /** Called with the trimmed prompt when the visitor submits. */
  onSubmit: (prompt: string) => void;
  /** True while a prompt is being processed. */
  loading: boolean;
  /** True while the CAD kernel is still loading. */
  disabled: boolean;
}

function SendIcon() {
  return (
    <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7 L11 7 M8 4 L11 7 L8 10" />
    </svg>
  );
}

export function PromptInput({ onSubmit, loading, disabled }: PromptInputProps) {
  const [text, setText] = useState("");
  const blocked = disabled || loading;
  const empty = text.trim().length === 0;

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    const trimmed = text.trim();
    if (trimmed && !blocked) {
      onSubmit(trimmed);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="group flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 shadow-panel transition focus-within:border-royal focus-within:shadow-focus"
    >
      <span className="font-mono text-2xs text-ink-faint">›</span>
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={blocked}
        placeholder="Describe a part — e.g. planetary gearbox with three planets"
        aria-label="Describe a part"
        className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
      <Button type="submit" variant="primary" size="sm" disabled={blocked || empty}>
        {loading ? (
          <>
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Generating
          </>
        ) : (
          <>
            Generate
            <SendIcon />
          </>
        )}
      </Button>
    </form>
  );
}
