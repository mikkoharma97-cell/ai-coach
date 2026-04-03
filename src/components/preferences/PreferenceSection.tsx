import type { ReactNode } from "react";

export function PreferenceSection({
  title,
  children,
  id,
}: {
  title: string;
  children: ReactNode;
  /** Ankkuri: asetukset → Valinnat (#id) */
  id?: string;
}) {
  return (
    <section
      id={id}
      className={
        id
          ? "scroll-mt-24 border-b border-white/[0.06] px-0 py-4 last:border-b-0"
          : "border-b border-white/[0.06] px-0 py-4 last:border-b-0"
      }
    >
      <h2 className="coach-section-label">{title}</h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

export function PreferenceField({
  label,
  children,
  id,
}: {
  label: string;
  children: ReactNode;
  /** Ankkuri: asetukset → Valinnat (#id) */
  id?: string;
}) {
  return (
    <div id={id} className={id ? "scroll-mt-28" : undefined}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function preferenceSelectClass() {
  return "min-h-[44px] w-full rounded-[var(--radius-lg)] border border-border bg-background px-3 py-2.5 text-[15px] text-foreground";
}
