interface BarChartProps {
  values: number[];
  labels: string[];
  highlightIndex?: number;
  bestIndex?: number;
}

export function BarChart({ values, labels, highlightIndex = 5, bestIndex }: BarChartProps) {
  const max = 10;
  const chartHeight = 88;
  const baseY = 104;
  const barWidth = 26;
  const gap = 10;
  const startX = 16;
  const width = 320;

  return (
    <svg
      viewBox={`0 0 ${width} 136`}
      role="img"
      aria-label={`Concurrencia por hora: ${labels.map((label, index) => `${label} ${values[index]}`).join(", ")}`}
      className="w-full"
    >
      {values.map((value, index) => {
        const height = Math.max(4, (value / max) * chartHeight);
        const x = startX + index * (barWidth + gap);
        const y = baseY - height;
        const isHighlight = index === highlightIndex;
        const isBest = bestIndex === index;
        const fill = isHighlight ? "fill-accent" : isBest ? "fill-ink" : "fill-fill-deep";
        return (
          <g key={labels[index]}>
            <rect x={x} y={y} width={barWidth} height={height} rx={6} className={fill} />
            <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" className="fill-text-secondary text-caption">
              {value}
            </text>
            <text x={x + barWidth / 2} y={124} textAnchor="middle" className="fill-text-muted text-caption">
              {labels[index]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
