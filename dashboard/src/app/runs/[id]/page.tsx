import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { ExecutionDetailView } from "@/components/execution-detail";
import { PageHeader } from "@/components/page-header";
import { RunStatusBadge } from "@/components/run-status-badge";
import { computeDetailStats } from "@/lib/execution-stats";
import { getExecution, isN8nConfigError } from "@/lib/n8n";

export const dynamic = "force-dynamic";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const execution = await getExecution(id);
    const stats = computeDetailStats(execution);

    return (
      <div>
        <Link
          href="/runs"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-kit-muted transition hover:text-kit-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to runs
        </Link>

        <PageHeader
          title="Run details"
          description={`Node success rate ${stats.nodeSuccessRate}% · ${stats.nodeTotal} nodes · ${execution.mode} mode`}
          action={<RunStatusBadge status={execution.status} />}
        />

        <ExecutionDetailView execution={execution} />
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <div className="space-y-4">
        <Link
          href="/runs"
          className="inline-flex items-center gap-1 text-sm font-medium text-kit-muted transition hover:text-kit-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to runs
        </Link>
        <div className="kit-panel p-6">
          <div className="flex gap-3">
            <div className="kit-icon-box kit-icon-box--error h-10 w-10">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold text-kit-text">Run not found</h1>
              <p className="mt-1 text-sm text-kit-muted">{message}</p>
              {!isN8nConfigError(error) && (
                <p className="mt-2 text-sm text-kit-muted">
                  Execution ID may be invalid or expired.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
