import Link from "next/link";
import { ChevronRight, FileText, Inbox } from "lucide-react";
import { formatDateTime, formatDuration, formatRelative } from "@/lib/format";
import type { ExecutionStatus, ExecutionSummary } from "@/lib/types";
import { RunStatusBadge } from "./run-status-badge";

const accentBorder: Partial<Record<ExecutionStatus, string>> = {
  success: "border-l-emerald-500",
  error: "border-l-red-500",
  running: "border-l-amber-500",
  waiting: "border-l-sky-500",
  canceled: "border-l-slate-400",
};

export function RunCards({ executions }: { executions: ExecutionSummary[] }) {
  if (executions.length === 0) {
    return (
      <div className="kit-panel kit-empty-state">
        <div className="kit-icon-box kit-icon-box--neutral h-14 w-14 rounded-2xl">
          <Inbox className="h-7 w-7" />
        </div>
        <p className="mt-5 text-base font-semibold text-kit-text">No runs yet</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-kit-muted">
          Run a workflow from the button above, or add a{" "}
          <code>pending</code> row to your Google Sheet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {executions.map((run) => (
        <RunCard key={run.id} run={run} />
      ))}
    </div>
  );
}

function RunCard({ run }: { run: ExecutionSummary }) {
  const isSuccess = run.status === "success";
  const isError = run.status === "error";
  const leftAccent = accentBorder[run.status] ?? "border-l-kit-border";

  return (
    <Link
      href={`/runs/${run.id}`}
      className={`kit-card kit-card-hover group flex flex-col border-l-4 p-5 ${leftAccent}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`kit-icon-box h-10 w-10 rounded-xl ${
              isSuccess
                ? "kit-icon-box--success"
                : isError
                  ? "kit-icon-box--error"
                  : "kit-icon-box--neutral"
            }`}
          >
            <FileText className="h-4 w-4" />
          </div>
          <RunStatusBadge status={run.status} />
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-kit-muted transition group-hover:translate-x-0.5 group-hover:text-kit-accent" />
      </div>

      <p className="mt-5 font-mono text-[11px] tracking-wide text-kit-muted uppercase">
        Run {run.id}
      </p>
      <p className="mt-1 text-xl font-semibold tracking-tight text-kit-text">
        {formatRelative(run.startedAt)}
      </p>
      <p className="mt-1 text-xs text-kit-muted">{formatDateTime(run.startedAt)}</p>

      <div className="mt-5 grid grid-cols-2 gap-2.5 border-t border-kit-border pt-4">
        <MiniField label="Mode" value={run.mode} capitalize />
        <MiniField label="Duration" value={formatDuration(run.durationMs)} />
        <MiniField
          label="Result"
          value={isSuccess ? "100%" : isError ? "Failed" : "—"}
          highlight={isSuccess}
          error={isError}
        />
        <MiniField label="Finished" value={run.stoppedAt ? "Yes" : "—"} />
      </div>

      <p className="mt-4 text-sm font-medium text-kit-accent transition group-hover:text-kit-accent-hover">
        View logs →
      </p>
    </Link>
  );
}

function MiniField({
  label,
  value,
  capitalize,
  highlight,
  error,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
  highlight?: boolean;
  error?: boolean;
}) {
  return (
    <div className="rounded-lg border border-kit-border bg-kit-surface-raised px-3 py-2.5">
      <p className="text-[10px] font-semibold tracking-wider text-kit-muted uppercase">
        {label}
      </p>
      <p
        className={`mt-0.5 text-sm font-semibold ${capitalize ? "capitalize" : ""} ${
          highlight
            ? "text-kit-success-text"
            : error
              ? "text-kit-error-text"
              : "text-kit-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
