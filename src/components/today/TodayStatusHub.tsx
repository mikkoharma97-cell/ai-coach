"use client";

type Props = {
  hubBlockClass: string;
  sectionTitle: string;
  lines: string[];
};

export function TodayStatusHub({ hubBlockClass, sectionTitle, lines }: Props) {
  return (
    <section className={hubBlockClass} aria-labelledby="today-hub-status-h">
      <h3
        id="today-hub-status-h"
        className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2"
      >
        {sectionTitle}
      </h3>
      <ul className="mt-2 space-y-1.5 text-[13px] leading-snug text-muted">
        {lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </section>
  );
}
