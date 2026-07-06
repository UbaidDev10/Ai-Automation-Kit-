import {
  DASHBOARD_WEBHOOK_NODE_NAME,
  KIT_CREDENTIALS,
  KIT_DEMO_SHEET_ROW,
  KIT_MAIN_WORKFLOW_NAME,
} from "./kit-config";
import type {
  CredentialSummary,
  ExecutionDetail,
  ExecutionStatus,
  ExecutionSummary,
  KitCredentialStatus,
  NodeLog,
  WorkflowSummary,
} from "./types";

type N8nNode = {
  name: string;
  type: string;
  parameters?: { path?: string };
};

function getConfig() {
  const baseUrl = process.env.N8N_BASE_URL ?? "http://localhost:5678";
  const apiKey = process.env.N8N_API_KEY;

  if (!apiKey) {
    throw new Error(
      "N8N_API_KEY is not set. Add it to dashboard/.env.local (copy from root .env)."
    );
  }

  return { baseUrl, apiKey };
}

async function n8nRequest(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; body: string }> {
  const { baseUrl, apiKey } = getConfig();
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "X-N8N-API-KEY": apiKey,
      Accept: "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  return { ok: res.ok, status: res.status, body: await res.text() };
}

async function n8nFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const result = await n8nRequest(path, init);

  if (!result.ok) {
    throw new Error(`n8n API ${result.status}: ${result.body || "Request failed"}`);
  }

  return JSON.parse(result.body) as T;
}

function normalizeStatus(
  status: string | undefined,
  finished?: boolean
): ExecutionStatus {
  if (!finished && status !== "error" && status !== "canceled") {
    if (status === "waiting") return "waiting";
    return "running";
  }

  switch (status) {
    case "success":
      return "success";
    case "error":
      return "error";
    case "waiting":
      return "waiting";
    case "canceled":
      return "canceled";
    case "running":
      return "running";
    default:
      return finished ? "success" : "unknown";
  }
}

function durationMs(
  startedAt: string | null | undefined,
  stoppedAt: string | null | undefined
): number | null {
  if (!startedAt || !stoppedAt) return null;
  const start = new Date(startedAt).getTime();
  const stop = new Date(stoppedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(stop)) return null;
  return Math.max(0, stop - start);
}

function mapExecution(raw: Record<string, unknown>): ExecutionSummary {
  const startedAt = (raw.startedAt as string) ?? null;
  const stoppedAt = (raw.stoppedAt as string) ?? null;

  return {
    id: String(raw.id),
    status: normalizeStatus(raw.status as string, raw.finished as boolean),
    startedAt,
    stoppedAt,
    mode: String(raw.mode ?? "unknown"),
    durationMs: durationMs(startedAt, stoppedAt),
  };
}

function extractNodeLogs(data: unknown): NodeLog[] {
  if (!data || typeof data !== "object") return [];

  const resultData = (data as { resultData?: { runData?: Record<string, unknown[]> } })
    .resultData;
  const runData = resultData?.runData;
  if (!runData) return [];

  return Object.entries(runData).map(([name, runs]) => {
    const lastRun = Array.isArray(runs) ? runs[runs.length - 1] : null;
    const run = lastRun as Record<string, unknown> | null;

    const error = run?.error as { message?: string } | undefined;
    const executionStatus = run?.executionStatus as string | undefined;

    return {
      name,
      status: normalizeStatus(
        executionStatus ?? (error ? "error" : "success"),
        true
      ),
      executionTimeMs:
        typeof run?.executionTime === "number" ? run.executionTime : null,
      errorMessage: error?.message ?? null,
      itemCount: Array.isArray(run?.data)
        ? (run.data as unknown[][]).reduce(
            (sum, branch) => sum + (Array.isArray(branch) ? branch.length : 0),
            0
          )
        : null,
    };
  });
}

function parseExecutionId(result: unknown): string | null {
  if (!result || typeof result !== "object") return null;
  const record = result as Record<string, unknown>;

  if (record.executionId != null) return String(record.executionId);

  const data = record.data;
  if (data && typeof data === "object") {
    const nested = data as Record<string, unknown>;
    if (nested.executionId != null) return String(nested.executionId);
  }

  return null;
}

function findDashboardWebhook(workflow: Record<string, unknown>): N8nNode | undefined {
  const nodes = (workflow.nodes as N8nNode[]) ?? [];
  return nodes.find(
    (node) =>
      node.type === "n8n-nodes-base.webhook" &&
      (node.name === DASHBOARD_WEBHOOK_NODE_NAME ||
        node.parameters?.path?.startsWith("kit-dashboard/"))
  );
}

function getWebhookPath(node: N8nNode): string {
  const path = node.parameters?.path;
  if (!path) {
    throw new Error('Workflow is missing a webhook path on the "Dashboard Run" node.');
  }
  return path.startsWith("/") ? path.slice(1) : path;
}

function buildPinDataForWorkflow(
  workflow: Record<string, unknown>
): Record<string, unknown[]> | undefined {
  const nodes = (workflow.nodes as N8nNode[]) ?? [];
  const trigger = nodes.find(
    (node) =>
      node.type.includes("Trigger") ||
      node.type.includes("trigger") ||
      node.type === "n8n-nodes-base.webhook"
  );

  if (!trigger || !trigger.type.includes("googleSheetsTrigger")) {
    return undefined;
  }

  return {
    [trigger.name]: [{ json: { ...KIT_DEMO_SHEET_ROW } }],
  };
}

function buildWebhookBody(workflow: Record<string, unknown>): Record<string, unknown> {
  const name = String(workflow.name ?? "");
  if (name === KIT_MAIN_WORKFLOW_NAME || name.includes("Automation Pipeline")) {
    return { ...KIT_DEMO_SHEET_ROW };
  }
  return {};
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function activateWorkflow(workflowId: string): Promise<void> {
  await n8nFetch(`/api/v1/workflows/${workflowId}/activate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
}

async function triggerDashboardWebhook(
  path: string,
  body: Record<string, unknown>
): Promise<void> {
  const { baseUrl } = getConfig();
  const url = `${baseUrl}/webhook/${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Webhook trigger failed (${res.status}): ${text || res.statusText}`);
  }
}

async function waitForNewExecution(
  workflowId: string,
  previousExecutionId: string | null,
  timeoutMs = 30000
): Promise<string> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const executions = await listExecutions(workflowId, 5);
    const newest = executions[0];

    if (newest && newest.id !== previousExecutionId) {
      if (newest.startedAt) {
        const started = new Date(newest.startedAt).getTime();
        if (Date.now() - started < 60_000) {
          return newest.id;
        }
      } else {
        return newest.id;
      }
    }

    await sleep(1000);
  }

  throw new Error(
    "Workflow was triggered but no new execution appeared within 30 seconds."
  );
}

async function executeViaPublicApi(
  workflowId: string,
  workflow: Record<string, unknown>
): Promise<{ executionId: string } | null> {
  const pinData = buildPinDataForWorkflow(workflow);
  const body: Record<string, unknown> = {};
  if (pinData) body.pinData = pinData;

  const attempt = await n8nRequest(`/api/v1/workflows/${workflowId}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!attempt.ok) {
    if (
      attempt.status === 404 ||
      attempt.status === 405 ||
      attempt.body.includes("not allowed")
    ) {
      return null;
    }
    throw new Error(`n8n API ${attempt.status}: ${attempt.body || "Execute failed"}`);
  }

  const parsed = JSON.parse(attempt.body) as unknown;
  const executionId = parseExecutionId(parsed);
  if (!executionId) {
    throw new Error(`n8n did not return an executionId: ${attempt.body.slice(0, 200)}`);
  }

  return { executionId };
}

async function executeViaWebhook(
  workflowId: string,
  workflow: Record<string, unknown>
): Promise<{ executionId: string }> {
  const webhookNode = findDashboardWebhook(workflow);
  if (!webhookNode) {
    throw new Error(
      'This workflow has no "Dashboard Run" webhook. Re-import kit workflows with .\\scripts\\import-workflows.ps1, then try again.'
    );
  }

  if (!workflow.active) {
    try {
      await activateWorkflow(workflowId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("Cannot publish workflow")) {
        throw new Error(
          "Workflow must be active to run from the dashboard. Open it in n8n, fix credential warnings, activate it, then try Run again."
        );
      }
      throw error;
    }
  }

  const previousExecutions = await listExecutions(workflowId, 1);
  const previousExecutionId = previousExecutions[0]?.id ?? null;

  await triggerDashboardWebhook(
    getWebhookPath(webhookNode),
    buildWebhookBody(workflow)
  );

  const executionId = await waitForNewExecution(
    workflowId,
    previousExecutionId
  );
  return { executionId };
}

function dedupeWorkflowsByName(workflows: WorkflowSummary[]): WorkflowSummary[] {
  const byName = new Map<string, WorkflowSummary>();

  for (const workflow of workflows) {
    const existing = byName.get(workflow.name);
    if (!existing) {
      byName.set(workflow.name, workflow);
      continue;
    }

    const existingTime = existing.updatedAt
      ? new Date(existing.updatedAt).getTime()
      : 0;
    const workflowTime = workflow.updatedAt
      ? new Date(workflow.updatedAt).getTime()
      : 0;

    if (workflowTime >= existingTime) {
      byName.set(workflow.name, workflow);
    }
  }

  return Array.from(byName.values()).sort((a, b) =>
    (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")
  );
}

export async function listWorkflows(): Promise<WorkflowSummary[]> {
  const result = await n8nFetch<{ data: Record<string, unknown>[] }>(
    "/api/v1/workflows?limit=100"
  );

  const workflows = result.data.map((wf) => ({
    id: String(wf.id),
    name: String(wf.name),
    active: Boolean(wf.active),
    updatedAt: (wf.updatedAt as string) ?? null,
  }));

  return dedupeWorkflowsByName(workflows);
}

export async function getWorkflowById(
  id: string
): Promise<Record<string, unknown>> {
  return n8nFetch(`/api/v1/workflows/${id}`);
}

export async function getMainWorkflow(): Promise<WorkflowSummary | null> {
  const workflows = await listWorkflows();
  return (
    workflows.find((wf) => wf.name === KIT_MAIN_WORKFLOW_NAME) ??
    workflows[0] ??
    null
  );
}

export async function listExecutions(
  workflowId: string,
  limit = 25
): Promise<ExecutionSummary[]> {
  const result = await n8nFetch<{ data: Record<string, unknown>[] }>(
    `/api/v1/executions?workflowId=${workflowId}&limit=${limit}`
  );

  return result.data.map(mapExecution);
}

export async function executeWorkflow(
  workflowId: string
): Promise<{ executionId: string }> {
  const workflow = await getWorkflowById(workflowId);

  const viaApi = await executeViaPublicApi(workflowId, workflow);
  if (viaApi) return viaApi;

  return executeViaWebhook(workflowId, workflow);
}

export async function listCredentials(): Promise<CredentialSummary[]> {
  const result = await n8nFetch<{ data: Record<string, unknown>[] }>(
    "/api/v1/credentials?limit=100"
  );

  return result.data.map((raw) => ({
    id: String(raw.id),
    name: String(raw.name),
    type: String(raw.type ?? "unknown"),
    updatedAt: (raw.updatedAt as string) ?? null,
  }));
}

export async function listKitCredentialStatuses(): Promise<{
  items: KitCredentialStatus[];
  connectedCount: number;
}> {
  const credentials = await listCredentials();
  const byName = new Map(credentials.map((cred) => [cred.name, cred]));

  const items: KitCredentialStatus[] = KIT_CREDENTIALS.map((kit) => {
    const found = byName.get(kit.n8nName);
    return {
      id: kit.id,
      label: kit.label,
      description: kit.description,
      n8nName: kit.n8nName,
      connected: Boolean(found),
      credentialId: found?.id ?? null,
      credentialType: found?.type ?? null,
      updatedAt: found?.updatedAt ?? null,
    };
  });

  return {
    items,
    connectedCount: items.filter((item) => item.connected).length,
  };
}

export async function getExecution(id: string): Promise<ExecutionDetail> {
  const raw = await n8nFetch<Record<string, unknown>>(
    `/api/v1/executions/${id}?includeData=true`
  );

  const summary = mapExecution(raw);
  const data = raw.data as unknown;

  return {
    ...summary,
    workflowId: String(raw.workflowId ?? ""),
    finished: Boolean(raw.finished),
    nodes: extractNodeLogs(data),
  };
}

export class N8nConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "N8nConfigError";
  }
}

export function isN8nConfigError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("N8N_API_KEY");
}
