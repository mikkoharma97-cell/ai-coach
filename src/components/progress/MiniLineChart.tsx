"use client";

import type { ChartPoint } from "@/lib/progress";

type Props = {
  points: ChartPoint[];
  /** Accent stroke — CSS color */
  stroke?: string;
  height?: number;
  className?: string;
  /** Softer grid / fill under line */
  fillUnder?: boolean;
  /** Muted chart (e.g. placeholder recovery) */
  variant?: "default" | "muted";
};

export function MiniLineChart({
  points,
  stroke = "var(--accent)",
  height = 120,
  className = "",
  fillUnder = true,
  variant = "default",
}: Props) {
  const w = 320;
  const pad = 12;
  const strokeW = variant === "muted" ? 2.25 : 3;
  if (points.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-[var(--radius-md)] border border-dashed border-white/10 bg-white/[0.02] text-[11px] text-muted-2 ${className}`}
        style={{ minHeight: height }}
      >
        —
      </div>
    );
  }

  const vals = points.map((p) => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const n = points.length;
  const coords = points.map((p, i) => {
    const x =
      n <= 1
        ? w / 2
        : pad + (i / (n - 1)) * (w - pad * 2);
    const yNorm = (p.value - min) / span;
    const y = pad + (1 - yNorm) * (height - pad * 2);
    return { x, y, p };
  });

  const d = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const last = coords[coords.length - 1]!;
  const first = coords[0]!;
  const fillD = `${d} L ${last.x} ${height - pad} L ${first.x} ${height - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      className={`w-full max-w-full ${className}`}
      style={{ height }}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="mlcFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.2" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fillUnder ? (
        <path
          d={fillD}
          fill="url(#mlcFill)"
          opacity={variant === "muted" ? 0.45 : 1}
        />
      ) : null}
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        opacity={variant === "muted" ? 0.55 : 1}
      />
      <circle
        cx={last.x}
        cy={last.y}
        r={variant === "muted" ? 5.5 : 8}
        fill="var(--background)"
        stroke={stroke}
        strokeWidth={variant === "muted" ? 2.25 : 2.75}
        opacity={variant === "muted" ? 0.65 : 1}
      />
      {variant === "default" ? (
        <circle
          cx={last.x}
          cy={last.y}
          r={12}
          fill="none"
          stroke={stroke}
          strokeWidth={1}
          opacity={0.32}
        />
      ) : null}
    </svg>
  );
}
