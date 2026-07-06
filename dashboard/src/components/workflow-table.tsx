import { ExternalLink, GitBranch } from "lucide-react";
import { RunWorkflowButton } from "@/components/run-workflow-button";
import { formatDateTime, formatRelative } from "@/lib/format";
import { KIT_MAIN_WORKFLOW_NAME, N8N_UI_URL } from "@/lib/kit-config";
import type { WorkflowSummary } from "@/lib/types";

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`kit-badge ${
        active
          ? "bg-kit-success-bg text-kit-success-text"
          : "bg-kit-surface-raised text-kit-muted"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-kit-muted"}`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function WorkflowTable({ workflows }: { workflows: WorkflowSummary[] }) {
  if (workflows.length === 0) {
    return (
      <div className="kit-panel kit-empty-state">
        <div className="kit-icon-box kit-icon-box--accent h-14 w-14 rounded-2xl">
          <GitBranch className="h-7 w-7" />
        </div>
        <p className="mt-5 text-base font-semibold text-kit-text">No workflows found</p>
        <p className="mt-2 max-w-sm text-sm text-kit-muted">
          Import workflows with <code>.\scripts\import-workflows.ps1</code> or create them in n8n.
        </p>
      </div>
    );
  }

  return (
    <div className="kit-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="kit-table-head">
              <th className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-kit-muted uppercase">
                Workflow
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-kit-muted uppercase">
                Status
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold tracking-wider text-kit-muted uppercase">
                Last updated
              </th>
              <th className="px-6 py-4 text-right text-[11px] font-bold tracking-wider text-kit-muted uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kit-border">
            {workflows.map((wf) => {
              const isMain = wf.name === KIT_MAIN_WORKFLOW_NAME;
              return (
                <tr key={wf.id} className="transition hover:bg-kit-surface-raised/70">
                  <td className="px-6 py-5">
                    <div className="flex items-start gap-4">
                      <div className="kit-icon-box kit-icon-box--accent h-11 w-11 rounded-xl">
                        <GitBranch className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-kit-text">{wf.name}</p>
                        <p className="mt-0.5 font-mono text-xs text-kit-muted">{wf.id}</p>
                        {isMain && (
                          <span className="mt-2 inline-block rounded-full bg-kit-info-bg px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-kit-info-text uppercase">
                            Main pipeline
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <ActiveBadge active={wf.active} />
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-medium text-kit-text">{formatRelative(wf.updatedAt)}</div>
                    <div className="mt-0.5 text-xs text-kit-muted">
                      {formatDateTime(wf.updatedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <RunWorkflowButton
                        workflowId={wf.id}
                        workflowName={wf.name}
                        variant="secondary"
                        size="sm"
                      />
                      <a
                        href={`${N8N_UI_URL}/workflow/${wf.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-kit-border bg-kit-surface px-3.5 py-2 text-xs font-semibold text-kit-text shadow-sm transition hover:border-kit-accent/30 hover:bg-kit-surface-raised"
                      >
                        Open
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
