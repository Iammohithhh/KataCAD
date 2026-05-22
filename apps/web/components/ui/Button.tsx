"use client";

// The one button primitive. Three variants, two sizes — every action surface
// in the app is built from this so they stay visually identical.
import { forwardRef } from "react";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "sm" | "md";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const BASE =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded font-medium " +
  "transition disabled:cursor-not-allowed disabled:opacity-40";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-royal text-surface shadow-panel hover:bg-royal-hover active:bg-royal-deep",
  outline:
    "border border-line-strong bg-surface text-ink hover:border-ink-faint " +
    "hover:bg-paper active:bg-line/60",
  ghost: "text-ink-muted hover:bg-paper hover:text-ink active:bg-line/60",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "outline", size = "md", className = "", type, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
        {...props}
      />
    );
  },
);
