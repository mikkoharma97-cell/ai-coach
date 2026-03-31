"use client";

import Link from "next/link";

type Props = {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "link";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

export function CTAButton({
  href,
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled,
  onClick,
}: Props) {
  const base =
    "inline-flex min-h-[48px] touch-manipulation items-center justify-center text-[15px] font-semibold tracking-[-0.02em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "min-w-[160px] rounded-[14px] bg-gradient-to-br from-[#3b82f6] to-[#2563eb] px-8 py-3.5 text-white shadow-[0_10px_30px_rgba(59,130,246,0.4)] transition duration-[250ms] ease-in-out hover:brightness-110 active:scale-[0.99]"
      : variant === "secondary"
        ? "min-w-[140px] rounded-[var(--radius-lg)] border border-border bg-card px-7 py-3.5 text-foreground shadow-sm hover:border-border-strong hover:bg-surface-subtle"
        : variant === "link"
          ? "min-h-0 min-w-0 rounded-none px-2 py-3 font-semibold text-muted underline decoration-border/80 decoration-1 underline-offset-[6px] hover:text-foreground hover:decoration-foreground/30"
          : "min-w-[120px] rounded-[var(--radius-lg)] px-4 py-3 text-accent hover:bg-accent-soft";

  const cls = `${base} ${styles} ${className}`;

  if (href) {
    return (
      <Link href={href} prefetch className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
