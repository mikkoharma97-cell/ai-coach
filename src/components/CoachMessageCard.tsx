type Props = {
  message: string;
};

export function CoachMessageCard({ message }: Props) {
  return (
    <aside className="rounded-[var(--radius-lg)] border border-border bg-surface-subtle/80 px-5 py-5 sm:px-6 sm:py-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-2">
        For today
      </p>
      <p className="mt-2 text-[14px] leading-[1.65] text-muted sm:text-[15px]">
        {message}
      </p>
    </aside>
  );
}
