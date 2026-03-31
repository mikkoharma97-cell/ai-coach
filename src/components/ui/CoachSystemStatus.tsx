type Props = {
  text: string;
  /** Extra ring (no animation) when Plan is steering from live signals */
  liveSignal?: boolean;
};

export function CoachSystemStatus({ text, liveSignal }: Props) {
  return (
    <div
      className={`mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-foreground/90 shadow-sm backdrop-blur transition duration-[250ms] ease-in-out ${
        liveSignal
          ? "shadow-[0_1px_2px_0_rgb(0_0_0/0.2),0_0_0_2px_rgba(59,130,246,0.15)]"
          : ""
      }`}
      role="status"
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      <span>{text}</span>
    </div>
  );
}
