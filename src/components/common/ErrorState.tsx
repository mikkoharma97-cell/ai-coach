export function ErrorState({
  title = "Jokin meni pieleen",
  description,
  actionLabel = "Yritä uudelleen",
  onAction,
}: {
  title?: string;
  /** Optional body line (e.g. empty / failed load explanation). */
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="p-6 text-center">
      <p
        className={
          description
            ? "mb-2 text-[15px] font-semibold text-foreground"
            : "mb-4 text-sm opacity-70"
        }
      >
        {title}
      </p>
      {description ? (
        <p className="mb-4 text-[15px] leading-relaxed text-muted" role="status">
          {description}
        </p>
      ) : null}
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-xl bg-white px-4 py-2 text-black"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
