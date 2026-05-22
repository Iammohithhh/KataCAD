"use client";

// The prompt box. The visitor types a part description and presses Enter (or
// the button); the studio routes it and loads the matching hero.
import { useState } from "react";

export interface PromptInputProps {
  /** Called with the trimmed prompt when the visitor submits. */
  onSubmit: (prompt: string) => void;
  /** True while a prompt is being routed. */
  loading: boolean;
  /** True while the CAD kernel is still loading. */
  disabled: boolean;
}

export function PromptInput({ onSubmit, loading, disabled }: PromptInputProps) {
  const [text, setText] = useState("");
  const blocked = disabled || loading;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (trimmed && !blocked) {
      onSubmit(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={blocked}
        placeholder="Describe a part — e.g. planetary gearbox with three planets"
        className="w-full border px-2 py-1"
      />
      <button type="submit" disabled={blocked} className="border px-3 py-1">
        {loading ? "Generating..." : "Generate"}
      </button>
    </form>
  );
}
