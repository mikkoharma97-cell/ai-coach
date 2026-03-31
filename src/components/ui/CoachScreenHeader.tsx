import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  /** e.g. `sr-only` to keep context for AT without visual noise */
  eyebrowClassName?: string;
  title: string;
  description?: string;
  /** e.g. link row below description */
  action?: ReactNode;
  className?: string;
};

/**
 * Shared app screen header — matches coach typography tokens (landing-adjacent).
 */
export function CoachScreenHeader({
  eyebrow,
  eyebrowClassName,
  title,
  description,
  action,
  className = "max-w-[22rem]",
}: Props) {
  return (
    <header className={className}>
      <p className={eyebrowClassName ? `coach-eyebrow ${eyebrowClassName}` : "coach-eyebrow"}>
        {eyebrow}
      </p>
      <h1 className="coach-screen-title mt-3">{title}</h1>
      {description ? (
        <p className="mt-2 text-[14px] leading-relaxed text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </header>
  );
}
