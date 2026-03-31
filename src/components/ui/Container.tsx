import type { ReactNode } from "react";

/* Parannus: yksi “content max width” tokeni teemaan; phone 26rem voisi kasvaa sm:+ kun haluat tabletti-first. */
const sizes = {
  /** Full width inside device frame (~430px); outer frame constrains layout */
  phone: "max-w-full",
  narrow: "max-w-xl",
  app: "max-w-[42rem]",
  default: "max-w-5xl",
  wide: "max-w-6xl",
} as const;

type Size = keyof typeof sizes;

type Props = {
  children: ReactNode;
  size?: Size;
  className?: string;
};

export function Container({ children, size = "default", className = "" }: Props) {
  return (
    <div
      className={`mx-auto w-full px-5 sm:px-8 lg:px-10 ${sizes[size]} ${className}`}
    >
      {children}
    </div>
  );
}
