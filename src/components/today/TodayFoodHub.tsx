"use client";

type Props = {
  hubBlockClass: string;
  sectionTitle: string;
  mealsLine: string;
  previewLines: string[];
};

/**
 * Toinen taso — ei kilpaile päänavigoinnin kanssa (ei linkkiä).
 */
export function TodayFoodHub({
  hubBlockClass,
  sectionTitle,
  mealsLine,
  previewLines,
}: Props) {
  return (
    <section className={hubBlockClass} aria-labelledby="today-hub-food-h">
      <h3
        id="today-hub-food-h"
        className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2"
      >
        {sectionTitle}
      </h3>
      <p className="mt-1.5 text-[13px] text-muted">{mealsLine}</p>
      <ul className="mt-2 space-y-1.5 text-[14px] leading-snug text-muted">
        {previewLines.map((line, i) => (
          <li key={i} className="line-clamp-2">
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
