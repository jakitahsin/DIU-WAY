import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:mb-10 md:flex-row md:items-end md:justify-between animate-rise">
      <div>
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand">
          <span className="h-1 w-6 rounded-full bg-lime" aria-hidden />
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        {description && <p className="mt-3 max-w-2xl text-base text-muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}
