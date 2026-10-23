interface BarcodeProps {
  /** Texto del que se derivan las barras: el mismo código siempre dibuja el mismo barcode. */
  value: string;
}

// Anchos (en módulos) alternando barra y espacio, generados de forma estable a partir del código.
function barWidths(value: string): number[] {
  let seed = 0;
  for (const char of value) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed;
  };

  const guard = [2, 1, 1, 1, 2, 1];
  const body: number[] = [];
  for (let index = 0; index < 54; index += 1) {
    const isBar = index % 2 === 0;
    const roll = next() % 10;
    // Barras: mayoría finas con algunas gruesas. Espacios: más parejos.
    body.push(isBar ? (roll < 5 ? 1 : roll < 8 ? 2 : 3) : roll < 6 ? 1 : 2);
  }
  return [...guard, ...body, ...guard.slice().reverse()];
}

// Código de barras decorativo para el ticket digital (no es escaneable).
export function Barcode({ value }: BarcodeProps) {
  const widths = barWidths(value);
  const total = widths.reduce((sum, width) => sum + width, 0);
  // Posición inicial de cada elemento: suma de los anchos anteriores.
  const bars = widths
    .map((width, index) => ({ width, x: widths.slice(0, index).reduce((sum, w) => sum + w, 0) }))
    .filter((_, index) => index % 2 === 0);

  return (
    <svg
      viewBox={`0 0 ${total} 40`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Código ${value}`}
      className="h-12 w-full text-ink"
    >
      {bars.map((bar) => (
        <rect key={bar.x} x={bar.x} y={0} width={bar.width} height={40} fill="currentColor" />
      ))}
    </svg>
  );
}
