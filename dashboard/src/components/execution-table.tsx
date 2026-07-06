import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import { formatDateTime, formatDuration, formatRelative } from "@/lib/format";
import type { ExecutionSummary } from "@/lib/types";
import { RunStatusBadge } from "./run-status-badge";

export function ExecutionTable({
  executions,
}: {
  executions: ExecutionSummary[];
}) {
  if (executions.length === 0) {
    return (
      <div className="kit-panel kit-empty-state">
        <div className="kit-icon-box kit-icon-box--neutral h-12 w-12 rounded-full">
          <Inbox className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm font-medium text-kit-text">No runs yet</p>
        <p className="mt-1 max-w-sm text-sm text-kit-muted">
          Run a workflow or add a <code>pending</code> row to your Google Sheet.
        </p>
      </div>
    );
  }

  return (
    <div className="kit-panel overflow-hidden">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="kit-table-head">
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold tracking-wide text-kit-muted uppercase">
              Started
            </th>
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold tracking-wide text-kit-muted uppercase">
              Status
            </th>
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold tracking-wide text-kit-muted uppercase">
              Mode
            </th>
            <th className="px-5 py-3.5 text-left text-[11px] font-semibold tracking-wide text-kit-muted uppercase">
              Duration
            </th>
            <th className="px-5 py-3.5 text-right text-[11px] font-semibold tracking-wide text-kit-muted uppercase">
              &nbsp;
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-kit-border">
          {executions.map((run) => (
            <tr key={run.id} className="transition hover:bg-kit-surface-raised/70">
              <td className="px-5 py-3.5">
                <p className="font-medium text-kit-text">{formatRelative(run.startedAt)}</p>
                <p className="text-xs text-kit-muted">{formatDateTime(run.startedAt)}</p>
              </td>
              <td className="px-5 py-3.5">
                <RunStatusBadge status={run.status} />
              </td>
              <td className="px-5 py-3.5 capitalize text-kit-muted">{run.mode}</td>
              <td className="px-5 py-3.5 text-kit-muted">{formatDuration(run.durationMs)}</td>
              <td className="px-5 py-3.5 text-right">
                <Link href={`/runs/${run.id}`} className="kit-link inline-flex items-center gap-0.5 text-sm">
                  Details
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
