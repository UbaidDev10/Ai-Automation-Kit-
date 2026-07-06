import { type ReactNode } from "react";

const iconTone = {
  neutral: "kit-icon-box--neutral",
  success: "kit-icon-box--success",
  error: "kit-icon-box--error",
  warning: "kit-icon-box--warning",
  info: "kit-icon-box--accent",
} as const;

export function InfoBox({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  children,
}: {
  label: string;
  value?: string | number;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: keyof typeof iconTone;
  children?: ReactNode;
}) {
  return (
    <div className="kit-metric flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold tracking-wide text-kit-muted uppercase">
          {label}
        </p>
        {Icon && (
          <div className={`kit-icon-box h-8 w-8 ${iconTone[tone]}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-3 min-w-0">
        {children ?? (
          <p className="text-2xl font-bold tabular-nums tracking-tight text-kit-text">
            {value}
          </p>
        )}
        {hint && <p className="mt-1.5 text-xs leading-relaxed text-kit-muted">{hint}</p>}
      </div>
    </div>
  );
}

export function SuccessRateBox({
  rate,
  label,
  hint,
}: {
  rate: number;
  label?: string;
  hint?: string;
}) {
  const tone =
    rate >= 80 ? "text-kit-success-text" : rate >= 50 ? "text-kit-warning-text" : "text-kit-error-text";
  const barColor =
    rate >= 80 ? "bg-emerald-500" : rate >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="kit-metric flex flex-col">
      <p className="text-[11px] font-semibold tracking-wide text-kit-muted uppercase">
        {label ?? "Success rate"}
      </p>
      <p className={`mt-3 text-3xl font-bold tabular-nums ${tone}`}>{rate}%</p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-kit-surface-raised">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
        />
      </div>
      {hint && <p className="mt-2 text-xs text-kit-muted">{hint}</p>}
    </div>
  );
}
