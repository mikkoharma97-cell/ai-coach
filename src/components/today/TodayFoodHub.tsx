"use client";

import Link from "next/link";

type Props = {
  hubBlockClass: string;
  sectionTitle: string;
  mealsLine: string;
  previewLines: string[];
  linkFoodLabel: string;
};

export function TodayFoodHub({
  hubBlockClass,
  sectionTitle,
  mealsLine,
  previewLines,
  linkFoodLabel,
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
      <ul className="mt-2 space-y-1.5 text-[14px] leading-snug text-foreground">
        {previewLines.map((line, i) => (
          <li key={i} className="line-clamp-2">
            {line}
          </li>
        ))}
      </ul>
      <Link
        href="/food/day"
        scroll={false}
        className="mt-2 inline-flex text-[13px] font-medium text-muted underline-offset-[3px] hover:text-foreground hover:underline"
      >
        {linkFoodLabel}
      </Link>
    </section>
  );
}
