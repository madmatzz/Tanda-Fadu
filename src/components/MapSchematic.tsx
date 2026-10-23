import type { Local } from "../demo/types";

interface MapSchematicProps {
  locals: Local[];
  selectedSlug?: string;
  activeFloor?: number;
  compact?: boolean;
}

const floorGeometry = [
  { label: "0", points: "34,292 244,318 318,268 108,244", x: 60, y: 252, w: 236, h: 58 },
  { label: "1", points: "56,202 236,222 308,176 128,156", x: 76, y: 168, w: 208, h: 44 },
  { label: "2", points: "78,116 226,132 296,90 148,74", x: 94, y: 88, w: 178, h: 34 },
];

export function MapSchematic({
  locals,
  selectedSlug = "el-poli",
  activeFloor = 0,
  compact = false,
}: MapSchematicProps) {
  return (
    <svg
      viewBox="0 0 340 350"
      role="img"
      aria-label="Mapa esquemático de los pisos de la FADU con la ubicación de los locales"
      className={compact ? "h-48 w-full" : "w-full"}
    >
      <defs>
        <pattern id="room-lines" width="34" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
          <path d="M 0 0 L 34 0" className="stroke-border-soft" strokeWidth={1} />
        </pattern>
      </defs>

      {[2, 1, 0].map((floor) => {
        const geometry = floorGeometry.find((item) => item.label === String(floor)) ?? floorGeometry[0];
        const active = floor === activeFloor;
        return (
          <g key={floor}>
            <polygon
              points={geometry.points}
              className={
                active
                  ? "fill-surface stroke-ink"
                  : "fill-surface-soft stroke-border"
              }
              strokeWidth={active ? 3 : 2}
            />
            <polygon points={geometry.points} className="fill-transparent stroke-border-soft" strokeWidth={1} />
            <path
              d={`M ${geometry.x + 16} ${geometry.y + 12} L ${geometry.x + geometry.w - 40} ${geometry.y + 12}`}
              className="stroke-border"
              strokeWidth={1.5}
            />
            <path
              d={`M ${geometry.x + 40} ${geometry.y + 32} L ${geometry.x + geometry.w - 16} ${geometry.y + 32}`}
              className="stroke-border"
              strokeWidth={1.5}
            />
            <path
              d={`M ${geometry.x + 80} ${geometry.y - 2} L ${geometry.x + 80} ${geometry.y + geometry.h}`}
              className="stroke-border"
              strokeWidth={1.5}
            />
            <path
              d={`M ${geometry.x + 160} ${geometry.y - 2} L ${geometry.x + 160} ${geometry.y + geometry.h}`}
              className="stroke-border"
              strokeWidth={1.5}
            />
            <text
              x="326"
              y={geometry.y + 22}
              textAnchor="end"
              className={active ? "fill-ink text-h3 font-bold" : "fill-text-muted text-h3 font-semibold"}
            >
              {floor}
            </text>
          </g>
        );
      })}

      {locals.map((local) => {
        const geometry = floorGeometry[local.map.floor] ?? floorGeometry[0];
        const cx = geometry.x + local.map.x * geometry.w;
        const cy = geometry.y + local.map.y * geometry.h;
        const selected = local.slug === selectedSlug;
        return (
          <g key={local.id}>
            {selected && <circle cx={cx} cy={cy} r={12} className="fill-accent opacity-25" />}
            <circle
              cx={cx}
              cy={cy}
              r={selected ? 7 : 6}
              className={selected ? "fill-accent stroke-surface" : "fill-text-muted stroke-surface"}
              strokeWidth={2}
            />
            <title>{`${local.name} · ${local.floorLabel}`}</title>
          </g>
        );
      })}

      <g aria-hidden>
        <path d="M 16 190 L 16 240" className="stroke-text-muted" strokeWidth={2} />
        <path d="M 12 196 L 16 188 L 20 196" className="fill-none stroke-text-muted" strokeWidth={2} />
        <path d="M 12 234 L 16 242 L 20 234" className="fill-none stroke-text-muted" strokeWidth={2} />
        <text x="4" y="218" className="fill-text-muted text-caption">↑↓</text>
      </g>
    </svg>
  );
}
