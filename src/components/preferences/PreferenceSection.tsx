import type { ReactNode } from "react";

export function PreferenceSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="coach-panel-subtle px-4 py-4">
      <h2 className="coach-section-label">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function PreferenceField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function preferenceSelectClass() {
  return "w-full rounded-[var(--radius-lg)] border border-border bg-background px-3 py-2.5 text-[15px] text-foreground";
}
