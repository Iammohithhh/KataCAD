// The KatACAD lockup — a datum-target mark plus the wordmark. Used in the
// studio header and the dossier title block so the brand reads identically
// in both places.

export interface WordmarkProps {
  /** Hide the text, show the mark alone. */
  markOnly?: boolean;
  className?: string;
}

/** The datum-target mark — an engineering origin symbol. */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="1.5"
        y="1.5"
        width="17"
        height="17"
        rx="2.5"
        className="fill-royal"
      />
      <circle
        cx="10"
        cy="10"
        r="4.4"
        className="stroke-surface"
        strokeWidth="1.3"
      />
      <path
        d="M10 2.6V8.1M10 11.9v5.5M2.6 10H8.1M11.9 10h5.5"
        className="stroke-surface"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Wordmark({ markOnly = false, className = "" }: WordmarkProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <BrandMark className="h-5 w-5" />
      {markOnly ? null : (
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          KatACAD
        </span>
      )}
    </span>
  );
}
