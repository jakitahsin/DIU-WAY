import { avatarTone, cn, initials } from "@/lib/cn";

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-2xl font-display font-bold ring-2 ring-surface",
        avatarTone(name),
        size === "sm" && "size-8 rounded-xl text-xs",
        size === "md" && "size-12 text-base",
        size === "lg" && "size-16 text-xl",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
