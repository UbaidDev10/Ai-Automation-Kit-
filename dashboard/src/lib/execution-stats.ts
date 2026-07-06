import type { ExecutionDetail, ExecutionSummary } from "./types";

export interface ExecutionListStats {
  total: number;
  success: number;
  failed: number;
  running: number;
  canceled: number;
  successRate: number;
  avgDurationMs: number | null;
}

export function computeListStats(
  executions: ExecutionSummary[]
): ExecutionListStats {
  const success = executions.filter((e) => e.status === "success").length;
  const failed = executions.filter((e) => e.status === "error").length;
  const running = executions.filter(
    (e) => e.status === "running" || e.status === "waiting"
  ).length;
  const canceled = executions.filter((e) => e.status === "canceled").length;
  const completed = success + failed + canceled;
  const successRate =
    completed > 0 ? Math.round((success / completed) * 100) : 0;

  const durations = executions
    .map((e) => e.durationMs)
    .filter((d): d is number => d != null);
  const avgDurationMs =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

  return {
    total: executions.length,
    success,
    failed,
    running,
    canceled,
    successRate,
    avgDurationMs,
  };
}

export interface RunDetailStats {
  nodeTotal: number;
  nodeSuccess: number;
  nodeFailed: number;
  nodeSuccessRate: number;
  totalItems: number;
}

export function computeDetailStats(execution: ExecutionDetail): RunDetailStats {
  const nodeSuccess = execution.nodes.filter((n) => n.status === "success").length;
  const nodeFailed = execution.nodes.filter((n) => n.status === "error").length;
  const nodeTotal = execution.nodes.length;
  const nodeSuccessRate =
    nodeTotal > 0 ? Math.round((nodeSuccess / nodeTotal) * 100) : 0;
  const totalItems = execution.nodes.reduce(
    (sum, n) => sum + (n.itemCount ?? 0),
    0
  );

  return {
    nodeTotal,
    nodeSuccess,
    nodeFailed,
    nodeSuccessRate,
    totalItems,
  };
}
