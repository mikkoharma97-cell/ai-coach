type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
}: Props) {
  const alignCls = align === "center" ? "text-center" : "text-left";
  return (
    <div className={alignCls}>
      {eyebrow ? (
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`mt-3 text-[1.625rem] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground sm:text-[1.875rem] sm:leading-[1.15] ${align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 max-w-lg text-[16px] leading-[1.65] text-muted sm:text-[17px] ${align === "center" ? "mx-auto" : ""}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
