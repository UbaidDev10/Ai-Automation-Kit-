"use client";

import { useState } from "react";
import { Power } from "lucide-react";
import { useToast } from "./toast-provider";

export function WorkflowToggle({
  workflowName,
  initialActive,
}: {
  workflowName: string;
  initialActive: boolean;
}) {
  const { showToast } = useToast();
  const [active, setActive] = useState(initialActive);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    setPending(true);
    const next = !active;

    setActive(next);
    await new Promise((r) => setTimeout(r, 400));
    setActive(initialActive);
    setPending(false);

    showToast({
      title: "Workflow toggle is stubbed",
      description: `To ${next ? "activate" : "deactivate"} "${workflowName}", use the Active switch in the n8n workflow editor for now.`,
      variant: "info",
    });
  }

  return (
    <div className="kit-card flex items-center justify-between gap-4 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-kit-accent-soft text-kit-accent">
          <Power className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-kit-text">Automation power</p>
          <p className="mt-0.5 text-sm text-kit-muted">
            {workflowName} is{" "}
            <span className={active ? "font-medium text-kit-success-text" : "text-kit-muted"}>
              {active ? "active" : "inactive"}
            </span>{" "}
            in n8n
          </p>
          <p className="mt-2 text-xs text-kit-warning-text">
            Stub — does not change n8n until PATCH /api/v1/workflows/:id is wired
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={active}
        disabled={pending}
        onClick={handleToggle}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-kit-accent ${
          active
            ? "border-kit-accent bg-kit-accent"
            : "border-kit-border bg-kit-surface-raised"
        } ${pending ? "opacity-60" : ""}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            active ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
