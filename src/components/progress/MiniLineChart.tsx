"use client";

import { useId } from "react";
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
  /** Smooth cubic segments when enough points (no extra deps) */
  smooth?: boolean;
  /** Thin horizontal guide at bottom */
  showBaseline?: boolean;
};

function buildSmoothLinePath(coords: { x: number; y: number }[]): string {
  if (coords.length === 0) return "";
  if (coords.length === 1) {
    const c = coords[0]!;
    return `M ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
  }
  if (coords.length === 2) {
    const a = coords[0]!;
    const b = coords[1]!;
    return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  const t = 0.28;
  let d = `M ${coords[0]!.x.toFixed(1)} ${coords[0]!.y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)]!;
    const p1 = coords[i]!;
    const p2 = coords[i + 1]!;
    const p3 = coords[Math.min(coords.length - 1, i + 2)]!;
    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = p2.y - (p3.y - p1.y) * t;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function buildLinearPath(coords: { x: number; y: number }[]): string {
  if (coords.length === 0) return "";
  const first = coords[0]!;
  let d = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)}`;
  for (let i = 1; i < coords.length; i++) {
    const c = coords[i]!;
    d += ` L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
  }
  return d;
}

export function MiniLineChart({
  points,
  stroke = "var(--accent)",
  height = 120,
  className = "",
  fillUnder = true,
  variant = "default",
  smooth = true,
  showBaseline = true,
}: Props) {
  const uid = useId();
  const gradId = `mlc${uid.replace(/[^a-zA-Z0-9_-]/g, "") || "g"}`;
  const w = 320;
  const pad = 14;
  const compact = height <= 80;
  const strokeW = compact ? 1.35 : variant === "muted" ? 1.25 : 1.55;
  const endR = compact ? 3.1 : 3.5;

  if (points.length === 0) {
    return (
      <div
        className={`flex min-h-[3.5rem] flex-col items-center justify-center gap-1 rounded-[var(--radius-lg)] bg-white/[0.025] px-3 py-3 text-center ${className}`}
        style={{ minHeight: height }}
        aria-hidden
      >
        <span className="h-px w-8 rounded-full bg-white/[0.12]" />
        <span className="text-[10px] font-medium tracking-[0.02em] text-muted-2/55">
          —
        </span>
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
      n <= 1 ? w / 2 : pad + (i / (n - 1)) * (w - pad * 2);
    const yNorm = (p.value - min) / span;
    const y = pad + (1 - yNorm) * (height - pad * 2);
    return { x, y, p };
  });

  const useSmooth = smooth && coords.length >= 3;
  const lineD = useSmooth
    ? buildSmoothLinePath(coords)
    : buildLinearPath(coords);

  const last = coords[coords.length - 1]!;
  const first = coords[0]!;
  const fillD = `${lineD} L ${last.x.toFixed(1)} ${height - pad} L ${first.x.toFixed(1)} ${height - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      className={`w-full max-w-full ${className}`}
      style={{ height }}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.12" />
          <stop offset="45%" stopColor={stroke} stopOpacity="0.045" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showBaseline ? (
        <>
          <line
            x1={pad}
            y1={height - pad}
            x2={w - pad}
            y2={height - pad}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          {n >= 2 ? (
            <line
              x1={pad}
              y1={pad + (height - pad * 2) * 0.5}
              x2={w - pad}
              y2={pad + (height - pad * 2) * 0.5}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
              strokeDasharray="3 5"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
        </>
      ) : null}
      {fillUnder ? (
        <path
          d={fillD}
          fill={`url(#${gradId})`}
          opacity={variant === "muted" ? 0.55 : 1}
        />
      ) : null}
      <path
        d={lineD}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        opacity={variant === "muted" ? 0.58 : 0.92}
      />
      <circle
        cx={last.x}
        cy={last.y}
        r={endR + 2.25}
        fill={stroke}
        opacity={variant === "muted" ? 0.12 : 0.18}
      />
      <circle
        cx={last.x}
        cy={last.y}
        r={endR}
        fill="var(--background)"
        stroke={stroke}
        strokeWidth={compact ? 1.35 : 1.5}
        opacity={variant === "muted" ? 0.8 : 1}
      />
      <circle
        cx={last.x}
        cy={last.y}
        r={compact ? 1.5 : 1.75}
        fill="rgba(255,255,255,0.65)"
        opacity={variant === "muted" ? 0.55 : 0.85}
      />
    </svg>
  );
}
