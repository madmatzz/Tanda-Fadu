export function PrinterTrayIllustration({
  topCount = 6,
  bottomCount = 3,
}: {
  topCount?: number;
  bottomCount?: number;
}) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-border bg-surface p-4">
      <svg
        viewBox="0 0 320 220"
        role="img"
        aria-label={`Bandeja de impresora con ${topCount} pedidos en la cola superior y ${bottomCount} en la bandeja inferior`}
        className="w-full max-w-prose"
      >
        <rect x="88" y="30" width="144" height="50" rx="4" className="fill-surface stroke-ink" strokeWidth={4} />
        <text x="160" y="64" textAnchor="middle" className="fill-ink text-big-number font-bold">{topCount}</text>

        <rect x="52" y="82" width="216" height="96" rx="24" className="fill-surface stroke-ink" strokeWidth={4} />
        <rect x="88" y="112" width="144" height="38" rx="4" className="fill-fill stroke-ink" strokeWidth={3} />
        <rect x="78" y="112" width="164" height="6" rx="3" className="fill-accent" />

        <polygon points="88,178 232,178 262,208 58,208" className="fill-surface stroke-ink" strokeWidth={4} />
        <text x="160" y="202" textAnchor="middle" className="fill-ink text-h1 font-bold">{bottomCount}</text>
      </svg>
    </div>
  );
}
