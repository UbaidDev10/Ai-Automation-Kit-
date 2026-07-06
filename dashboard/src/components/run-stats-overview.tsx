import {
  Activity,
  CheckCircle2,
  Clock,
  ListChecks,
  XCircle,
} from "lucide-react";
import { formatDuration } from "@/lib/format";
import type { ExecutionListStats } from "@/lib/execution-stats";
import { InfoBox, SuccessRateBox } from "./info-box";

export function RunStatsOverview({ stats }: { stats: ExecutionListStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <SuccessRateBox
        rate={stats.successRate}
        hint={`${stats.success} of ${stats.success + stats.failed + stats.canceled} completed runs`}
      />
      <InfoBox
        label="Total runs"
        value={stats.total}
        hint="In this view"
        icon={ListChecks}
        tone="info"
      />
      <InfoBox
        label="Successful"
        value={stats.success}
        hint="Completed without errors"
        icon={CheckCircle2}
        tone="success"
      />
      <InfoBox
        label="Failed"
        value={stats.failed}
        hint="Runs with errors"
        icon={XCircle}
        tone="error"
      />
      <InfoBox
        label="Avg duration"
        value={stats.avgDurationMs != null ? formatDuration(stats.avgDurationMs) : "—"}
        hint={stats.running > 0 ? `${stats.running} still running` : "Across all runs"}
        icon={Clock}
        tone="neutral"
      />
    </div>
  );
}

export function RunDetailStatsOverview({
  nodeSuccessRate,
  nodeSuccess,
  nodeFailed,
  nodeTotal,
  totalItems,
  durationMs,
  status,
}: {
  nodeSuccessRate: number;
  nodeSuccess: number;
  nodeFailed: number;
  nodeTotal: number;
  totalItems: number;
  durationMs: number | null;
  status: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <SuccessRateBox
        rate={nodeSuccessRate}
        label="Node success"
        hint={`${nodeSuccess} of ${nodeTotal} nodes passed`}
      />
      <InfoBox
        label="Run status"
        icon={Activity}
        tone={status === "success" ? "success" : status === "error" ? "error" : "warning"}
      >
        <p className="text-lg font-semibold capitalize text-kit-text">{status}</p>
      </InfoBox>
      <InfoBox
        label="Nodes executed"
        value={nodeTotal}
        hint={`${nodeFailed} failed`}
        icon={ListChecks}
        tone="info"
      />
      <InfoBox
        label="Items processed"
        value={totalItems}
        hint="Total across all nodes"
        icon={CheckCircle2}
        tone="neutral"
      />
      <InfoBox
        label="Duration"
        value={durationMs != null ? formatDuration(durationMs) : "—"}
        hint="End to end"
        icon={Clock}
        tone="neutral"
      />
      <InfoBox
        label="Failed nodes"
        value={nodeFailed}
        hint={nodeFailed > 0 ? "See logs below" : "All nodes OK"}
        icon={XCircle}
        tone={nodeFailed > 0 ? "error" : "success"}
      />
    </div>
  );
}
