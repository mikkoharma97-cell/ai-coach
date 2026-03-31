"use client";

type Option<T extends string | number> = { value: T; label: string };

type Props<T extends string | number> = {
  step: number;
  total: number;
  title: string;
  description?: string;
  /** One line under the title — use for empathy or clarity on sensitive questions */
  helperText?: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function QuestionCard<T extends string | number>({
  step,
  total,
  title,
  description,
  helperText,
  options,
  value,
  onChange,
}: Props<T>) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="rounded-[var(--radius-2xl)] border border-border bg-card p-7 shadow-[var(--shadow-card)] sm:p-10 sm:pt-11">
      <div className="mb-10">
        <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
          Step {step} of {total}
        </p>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-surface-muted"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`Step ${step} of ${total}`}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <h2 className="text-[1.4rem] font-semibold leading-[1.25] tracking-[-0.02em] text-foreground sm:text-[1.625rem]">
        {title}
      </h2>
      {helperText ? (
        <p className="mt-3 text-[14px] leading-relaxed text-muted-2 sm:text-[15px]">
          {helperText}
        </p>
      ) : null}
      {description ? (
        <p className="mt-4 text-[15px] leading-[1.65] text-muted sm:text-[16px]">
          {description}
        </p>
      ) : null}
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`rounded-[var(--radius-lg)] border px-5 py-4 text-left text-[15px] font-medium leading-snug tracking-[-0.01em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 sm:min-h-[3.25rem] ${
                selected
                  ? "border-accent bg-accent-soft text-accent shadow-sm ring-1 ring-accent/15"
                  : "border-border bg-surface-subtle/50 hover:border-accent-ring/40 hover:bg-card"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
