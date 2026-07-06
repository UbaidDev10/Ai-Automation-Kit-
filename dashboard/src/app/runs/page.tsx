import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PageHeader, SectionHeader } from "@/components/page-header";
import { RunCards } from "@/components/run-cards";
import { RunStatsOverview } from "@/components/run-stats-overview";
import { RunWorkflowButton } from "@/components/run-workflow-button";
import { computeListStats } from "@/lib/execution-stats";
import {
  getMainWorkflow,
  isN8nConfigError,
  listExecutions,
} from "@/lib/n8n";

export const dynamic = "force-dynamic";

export default async function RunsPage() {
  try {
    const workflow = await getMainWorkflow();
    if (!workflow) {
      return (
        <div className="kit-panel p-8 text-center">
          <p className="text-sm text-kit-warning-text">
            Main workflow not found. Run <code>.\scripts\import-workflows.ps1</code> first.
          </p>
        </div>
      );
    }

    const executions = await listExecutions(workflow.id, 25);
    const stats = computeListStats(executions);

    return (
      <div>
        <PageHeader
          title="Runs"
          description={`Execution history, success rate, and logs for ${workflow.name}.`}
          action={
            <RunWorkflowButton
              workflowId={workflow.id}
              workflowName={workflow.name}
            />
          }
        />

        <section className="mb-8">
          <SectionHeader
            title="Run statistics"
            description="Success percentage and summary metrics from recent executions"
          />
          <RunStatsOverview stats={stats} />
        </section>

        <section>
          <SectionHeader
            title="Execution logs"
            description="Each card is one run — click to view full node-level logs"
            action={
              executions.length > 0 ? (
                <span className="kit-badge kit-badge--shell">
                  {executions.length} run{executions.length === 1 ? "" : "s"}
                </span>
              ) : undefined
            }
          />
          <RunCards executions={executions} />
        </section>
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <div className="kit-panel p-8">
        <div className="flex gap-4">
          <div className="kit-icon-box kit-icon-box--error h-12 w-12 rounded-xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-kit-text">Failed to load runs</h1>
            <p className="mt-1 text-sm text-kit-muted">{message}</p>
            {isN8nConfigError(error) && (
              <Link href="/credentials" className="kit-link mt-3 inline-block text-sm">
                Check credentials →
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }
}
