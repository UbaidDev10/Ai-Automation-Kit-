"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { useToast } from "./toast-provider";

export function RunWorkflowButton({
  workflowId,
  workflowName,
  variant = "primary",
  size = "md",
}: {
  workflowId: string;
  workflowName?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [running, setRunning] = useState(false);

  async function handleRun() {
    setRunning(true);
    try {
      const res = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start workflow");

      showToast({
        title: "Workflow started",
        description: workflowName
          ? `"${workflowName}" is running.`
          : "Opening run details…",
        variant: "success",
      });
      router.push(`/runs/${data.executionId}`);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      showToast({
        title: "Could not run workflow",
        description: message.includes("403")
          ? "Add workflow:execute scope to your n8n API key."
          : message.includes("Dashboard Run")
            ? "Re-import workflows: .\\scripts\\import-workflows.ps1"
            : message.includes("30 seconds")
              ? "The workflow started but took too long to appear in Runs. Check n8n executions."
              : message,
        variant: "error",
      });
    } finally {
      setRunning(false);
    }
  }

  const sizeClass = size === "sm" ? "h-8 gap-1.5 px-3 text-xs" : "h-10 gap-2 px-4 text-sm";
  const base =
    variant === "primary"
      ? "bg-kit-accent text-white shadow-sm shadow-blue-900/20 hover:bg-kit-accent-hover"
      : "border border-kit-border bg-kit-surface text-kit-text hover:border-kit-accent/30 hover:bg-kit-surface-raised";

  return (
    <button
      type="button"
      onClick={handleRun}
      disabled={running}
      className={`inline-flex items-center rounded-lg font-medium transition disabled:opacity-50 ${sizeClass} ${base}`}
    >
      {running ? (
        <Loader2 className={`animate-spin ${size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
      ) : (
        <Play className={`fill-current ${size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
      )}
      {running ? "Starting…" : size === "sm" ? "Run" : "Run workflow"}
    </button>
  );
}
