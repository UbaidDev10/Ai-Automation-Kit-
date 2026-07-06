import type { ExecutionStatus } from "@/lib/types";

const styles: Record<ExecutionStatus, string> = {
  success: "bg-kit-success-bg text-kit-success-text ring-1 ring-emerald-200/80",
  error: "bg-kit-error-bg text-kit-error-text ring-1 ring-red-200/80",
  running: "bg-kit-warning-bg text-kit-warning-text ring-1 ring-amber-200/80",
  waiting: "bg-kit-info-bg text-kit-info-text ring-1 ring-blue-200/80",
  canceled: "bg-kit-surface-raised text-kit-muted ring-1 ring-kit-border",
  unknown: "bg-kit-surface-raised text-kit-muted ring-1 ring-kit-border",
};

const labels: Record<ExecutionStatus, string> = {
  success: "Success",
  error: "Failed",
  running: "Running",
  waiting: "Waiting",
  canceled: "Canceled",
  unknown: "Unknown",
};

export function RunStatusBadge({ status }: { status: ExecutionStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
