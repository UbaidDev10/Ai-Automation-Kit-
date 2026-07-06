import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  GitBranch,
  Power,
  Zap,
} from "lucide-react";
import { ExecutionTable } from "@/components/execution-table";
import { PageHeader, SectionHeader } from "@/components/page-header";
import { RunStatusBadge } from "@/components/run-status-badge";
import { RunWorkflowButton } from "@/components/run-workflow-button";
import { formatDateTime, formatRelative } from "@/lib/format";
import {
  getMainWorkflow,
  isN8nConfigError,
  listExecutions,
} from "@/lib/n8n";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  try {
    const workflow = await getMainWorkflow();
    const executions = workflow ? await listExecutions(workflow.id, 5) : [];
    const latest = executions[0] ?? null;

    return (
      <div>
        <PageHeader
          title="Overview"
          description="Monitor pipeline health, review recent runs, and trigger workflows."
          action={
            workflow ? (
              <RunWorkflowButton
                workflowId={workflow.id}
                workflowName={workflow.name}
              />
            ) : undefined
          }
        />

        {workflow && (
          <div className="kit-panel mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex min-w-0 items-start gap-4">
              <div className="kit-icon-box kit-icon-box--accent h-12 w-12 rounded-xl">
                <GitBranch className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-kit-muted uppercase">
                  Primary workflow
                </p>
                <p className="mt-1 truncate text-lg font-semibold text-kit-text">
                  {workflow.name}
                </p>
                <p className="mt-1 text-sm text-kit-muted">
                  {latest
                    ? `Last run ${formatRelative(latest.startedAt)}`
                    : "No executions yet"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`kit-badge ${
                  workflow.active
                    ? "bg-kit-success-bg text-kit-success-text"
                    : "bg-kit-surface-raised text-kit-muted"
                }`}
              >
                <Power className="h-3 w-3" />
                {workflow.active ? "Active" : "Inactive"}
              </span>
              {latest && <RunStatusBadge status={latest.status} />}
              <Link href="/workflows" className="kit-link text-sm">
                Manage →
              </Link>
            </div>
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Zap}
            label="Workflow"
            value={truncate(workflow?.name ?? "Not found", 28)}
            sub={workflow ? (workflow.active ? "Running in n8n" : "Turn on in n8n") : "Import required"}
            tone={workflow?.active ? "success" : "warning"}
          />
          <MetricCard
            icon={Clock}
            label="Last run"
            value={latest ? formatRelative(latest.startedAt) : "—"}
            sub={latest ? formatDateTime(latest.startedAt) : "No runs recorded"}
            tone="neutral"
          />
          <MetricCard
            icon={latest?.status === "error" ? AlertTriangle : CheckCircle2}
            label="Last status"
            value={latest ? statusLabel(latest.status) : "—"}
            sub={latest?.status === "error" ? "Check run details" : "Latest result"}
            tone={latest?.status === "error" ? "error" : latest ? "success" : "neutral"}
          />
          <MetricCard
            icon={ArrowRight}
            label="Recent runs"
            value={String(executions.length)}
            sub="Displayed below"
            tone="neutral"
          />
        </div>

        <section>
          <SectionHeader
            title="Recent activity"
            action={
              <Link href="/runs" className="kit-link inline-flex items-center gap-1 text-sm">
                View all runs
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <ExecutionTable executions={executions} />
        </section>
      </div>
    );
  } catch (error) {
    return <ErrorPanel error={error} />;
  }
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    success: "Success",
    error: "Failed",
    running: "Running",
    waiting: "Waiting",
    canceled: "Canceled",
  };
  return map[status] ?? status;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  tone: "success" | "warning" | "error" | "neutral";
}) {
  const iconTone = {
    success: "kit-icon-box--success",
    warning: "kit-icon-box--warning",
    error: "kit-icon-box--error",
    neutral: "kit-icon-box--neutral",
  };

  return (
    <div className="kit-metric">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold tracking-wide text-kit-muted uppercase">
          {label}
        </p>
        <div className={`kit-icon-box h-8 w-8 ${iconTone[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 truncate text-xl font-semibold text-kit-text">{value}</p>
      <p className="mt-1 truncate text-xs text-kit-muted">{sub}</p>
    </div>
  );
}

function ErrorPanel({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Unknown error";
  const isConfig = isN8nConfigError(error);

  return (
    <div className="kit-panel mx-auto max-w-lg p-6">
      <div className="flex gap-4">
        <div className="kit-icon-box kit-icon-box--error h-10 w-10">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-semibold text-kit-text">
            {isConfig ? "Dashboard not configured" : "Could not reach n8n"}
          </h1>
          <p className="mt-1 text-sm text-kit-muted">{message}</p>
        </div>
      </div>
    </div>
  );
}
