import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { formatDateTime, formatDuration } from "@/lib/format";
import { computeDetailStats } from "@/lib/execution-stats";
import type { ExecutionDetail } from "@/lib/types";
import { InfoBox } from "./info-box";
import { RunDetailStatsOverview } from "./run-stats-overview";
import { RunStatusBadge } from "./run-status-badge";

export function ExecutionDetailView({ execution }: { execution: ExecutionDetail }) {
  const stats = computeDetailStats(execution);

  return (
    <div className="space-y-8">
      <RunDetailStatsOverview
        nodeSuccessRate={stats.nodeSuccessRate}
        nodeSuccess={stats.nodeSuccess}
        nodeFailed={stats.nodeFailed}
        nodeTotal={stats.nodeTotal}
        totalItems={stats.totalItems}
        durationMs={execution.durationMs}
        status={execution.status}
      />

      <section>
        <h2 className="mb-4 text-base font-semibold text-kit-text">Run information</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoBox label="Execution ID">
            <p className="break-all font-mono text-sm font-medium text-kit-text">
              {execution.id}
            </p>
          </InfoBox>
          <InfoBox label="Workflow ID">
            <p className="break-all font-mono text-sm font-medium text-kit-text">
              {execution.workflowId || "—"}
            </p>
          </InfoBox>
          <InfoBox label="Started" value={formatDateTime(execution.startedAt)} />
          <InfoBox label="Finished" value={formatDateTime(execution.stoppedAt)} />
          <InfoBox label="Mode">
            <p className="text-lg font-semibold capitalize text-kit-text">{execution.mode}</p>
          </InfoBox>
          <InfoBox label="Finished flag">
            <p className="text-lg font-semibold text-kit-text">
              {execution.finished ? "Yes" : "No"}
            </p>
          </InfoBox>
          <InfoBox label="Overall status">
            <RunStatusBadge status={execution.status} />
          </InfoBox>
          <InfoBox
            label="Total duration"
            value={formatDuration(execution.durationMs)}
          />
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-kit-text">Execution logs</h2>
          <p className="mt-1 text-sm text-kit-muted">
            Per-node output from n8n. {stats.nodeTotal} nodes · {stats.nodeSuccessRate}%
            success rate
          </p>
        </div>

        {execution.nodes.length === 0 ? (
          <div className="kit-panel kit-empty-state text-sm text-kit-muted">
            No node-level log data available for this run.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {execution.nodes.map((node, index) => (
              <div key={node.name} className="kit-panel overflow-hidden">
                <div
                  className={`flex items-center justify-between border-b border-kit-border px-4 py-3 ${
                    node.status === "success"
                      ? "bg-kit-success-bg/60"
                      : node.status === "error"
                        ? "bg-kit-error-bg/60"
                        : "bg-kit-surface-raised"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <NodeIcon status={node.status} />
                    <div>
                      <p className="text-sm font-semibold text-kit-text">{node.name}</p>
                      <p className="text-xs text-kit-muted">Step {index + 1}</p>
                    </div>
                  </div>
                  <RunStatusBadge status={node.status} />
                </div>

                <div className="grid grid-cols-2 gap-px bg-kit-border p-px">
                  <LogField label="Duration" value={formatDuration(node.executionTimeMs)} />
                  <LogField
                    label="Items"
                    value={node.itemCount != null ? String(node.itemCount) : "—"}
                  />
                  <LogField
                    label="Result"
                    value={node.status === "success" ? "Pass" : node.status === "error" ? "Fail" : "—"}
                    wide
                  />
                </div>

                {node.errorMessage && (
                  <div className="border-t border-kit-border bg-kit-error-bg/30 px-4 py-3">
                    <p className="text-[10px] font-semibold tracking-wide text-kit-error-text uppercase">
                      Error log
                    </p>
                    <p className="mt-1 font-mono text-xs leading-relaxed text-kit-error-text">
                      {node.errorMessage}
                    </p>
                  </div>
                )}

                {node.status === "success" && !node.errorMessage && (
                  <div className="border-t border-kit-border px-4 py-3">
                    <p className="text-xs text-kit-muted">
                      Node completed successfully
                      {node.itemCount != null ? ` · ${node.itemCount} items processed` : ""}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function LogField({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`bg-kit-surface px-4 py-3 ${wide ? "col-span-2" : ""}`}
    >
      <p className="text-[10px] font-semibold tracking-wide text-kit-muted uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-kit-text">{value}</p>
    </div>
  );
}

function NodeIcon({ status }: { status: ExecutionDetail["nodes"][0]["status"] }) {
  if (status === "success") {
    return <CheckCircle2 className="h-5 w-5 shrink-0 text-kit-success-text" />;
  }
  if (status === "error") {
    return <AlertCircle className="h-5 w-5 shrink-0 text-kit-error-text" />;
  }
  return <Clock className="h-5 w-5 shrink-0 text-kit-warning-text" />;
}
