import { type ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-kit-text sm:text-[28px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-kit-muted sm:text-[15px]">
            {description}
          </p>
        )}
        <div className="mt-4 h-0.5 w-12 rounded-full bg-kit-accent" />
      </div>
      {action && <div className="shrink-0 pt-1">{action}</div>}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-kit-text">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-kit-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
