type Props = {
  label: string;
  value: string;
  hint?: string;
};

export function ProgressCard({ label, value, hint }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
      <p className="text-[13px] font-medium text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-[14px] leading-relaxed text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
