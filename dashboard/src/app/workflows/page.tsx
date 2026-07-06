import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { WorkflowTable } from "@/components/workflow-table";
import { isN8nConfigError, listWorkflows } from "@/lib/n8n";
import { N8N_UI_URL } from "@/lib/kit-config";

export const dynamic = "force-dynamic";

export default async function WorkflowsPage() {
  try {
    const workflows = await listWorkflows();
    const activeCount = workflows.filter((w) => w.active).length;

    return (
      <div className="space-y-10">
        <PageHeader
          title="Workflows"
          description="All n8n workflows in your kit. Run manually, check status, or open in the editor."
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <SummaryTile label="Total workflows" value={String(workflows.length)} />
          <SummaryTile label="Active" value={String(activeCount)} variant="success" />
          <SummaryTile
            label="Inactive"
            value={String(workflows.length - activeCount)}
            variant="muted"
          />
        </div>

        <WorkflowTable workflows={workflows} />

        <p className="text-center text-sm text-kit-muted">
          Import kit workflows with <code>.\scripts\import-workflows.ps1</code> or manage in{" "}
          <a
            href={N8N_UI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="kit-link font-semibold"
          >
            n8n
          </a>
        </p>
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <div className="kit-card p-8">
        <div className="flex gap-4">
          <div className="kit-icon-box kit-icon-box--error h-12 w-12 rounded-xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-kit-text">Failed to load workflows</h1>
            <p className="mt-1 text-sm text-kit-muted">{message}</p>
            {isN8nConfigError(error) && (
              <Link href="/credentials" className="kit-link mt-3 inline-block text-sm">
                Check credentials setup →
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }
}

function SummaryTile({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?: "default" | "success" | "muted";
}) {
  const valueColor =
    variant === "success"
      ? "text-kit-success-text"
      : variant === "muted"
        ? "text-kit-muted"
        : "text-kit-text";

  return (
    <div className="kit-stat-card">
      <div
        className={`kit-stat-accent ${
          variant === "success" ? "bg-emerald-500" : variant === "muted" ? "bg-kit-border" : "bg-kit-accent"
        }`}
      />
      <div className="p-5">
        <p className="text-xs font-bold tracking-wider text-kit-muted uppercase">{label}</p>
        <p className={`mt-2 text-4xl font-bold tabular-nums ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}
