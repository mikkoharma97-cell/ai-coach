export function AppPreview() {
  return (
    <div className="w-full max-w-[340px] lg:max-w-none lg:translate-x-2">
      <div className="rounded-[1.75rem] border border-border-strong/70 bg-card p-2.5 shadow-[var(--shadow-float)] ring-1 ring-black/[0.03]">
        <div className="overflow-hidden rounded-[1.375rem] bg-surface-muted/80 ring-1 ring-border/80">
          <div className="bg-gradient-to-b from-background to-card p-4 sm:p-5">
            <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border-strong/60 bg-card shadow-[var(--shadow-today)]">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_80%_at_100%_0%,var(--accent-glow),transparent_50%)]"
                aria-hidden
              />
              <div className="relative px-5 pb-6 pt-6 sm:px-6">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent">
                  Today
                </p>
                <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-2">
                  Monday
                </p>
                <p className="mt-1 text-[1.125rem] font-semibold leading-tight tracking-[-0.02em] text-foreground">
                  March 29, 2026
                </p>
                <p className="mt-4 text-[11px] leading-relaxed text-muted">
                  In order, when you can. One check when you’re done.
                </p>
                <div className="mt-5 space-y-2 border-t border-border/60 pt-5 text-[11px] leading-relaxed text-muted">
                  <p>
                    <span className="font-semibold text-foreground">Workout · </span>
                    Full-body + cardio, 30 min
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Food · </span>
                    3 meals + protein snack
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Activity · </span>
                    8,000 steps
                  </p>
                </div>
                <div className="mt-6 h-11 rounded-[var(--radius-md)] bg-accent text-center text-[13px] font-semibold leading-[2.75rem] text-white shadow-[var(--shadow-primary-cta)]">
                  Mark as done
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
