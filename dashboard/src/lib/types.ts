export type ExecutionStatus =
  | "success"
  | "error"
  | "running"
  | "waiting"
  | "canceled"
  | "unknown";

export interface WorkflowSummary {
  id: string;
  name: string;
  active: boolean;
  updatedAt: string | null;
}

export interface ExecutionSummary {
  id: string;
  status: ExecutionStatus;
  startedAt: string | null;
  stoppedAt: string | null;
  mode: string;
  durationMs: number | null;
}

export interface NodeLog {
  name: string;
  status: ExecutionStatus;
  executionTimeMs: number | null;
  errorMessage: string | null;
  itemCount: number | null;
}

export interface ExecutionDetail extends ExecutionSummary {
  workflowId: string;
  finished: boolean;
  nodes: NodeLog[];
}

export interface CredentialSummary {
  id: string;
  name: string;
  type: string;
  updatedAt: string | null;
}

export interface KitCredentialStatus {
  id: string;
  label: string;
  description: string;
  n8nName: string;
  connected: boolean;
  credentialId: string | null;
  credentialType: string | null;
  updatedAt: string | null;
}
