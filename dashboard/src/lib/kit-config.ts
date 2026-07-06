export const KIT_MAIN_WORKFLOW_NAME =
  process.env.KIT_MAIN_WORKFLOW_NAME ?? "Kit Main Automation Pipeline";

/** Demo sheet row sent when running the main pipeline from the dashboard. */
export const KIT_DEMO_SHEET_ROW = {
  message: "Dashboard test run — client requested enterprise pricing quote",
  status: "pending",
  source: "dashboard",
} as const;

export const DASHBOARD_WEBHOOK_NODE_NAME = "Dashboard Run";

export const N8N_UI_URL =
  process.env.N8N_BASE_URL ?? "http://localhost:5678";

/** Open an existing credential in the n8n editor, or the credentials list to create one. */
export function n8nCredentialUrl(credentialId?: string | null): string {
  if (credentialId) {
    return `${N8N_UI_URL}/credential/${credentialId}`;
  }
  return `${N8N_UI_URL}/home/credentials`;
}

export const KIT_CREDENTIALS = [
  {
    id: "gmail",
    label: "Gmail",
    description: "Send notification emails",
    n8nName: "Kit - Gmail",
  },
  {
    id: "slack",
    label: "Slack",
    description: "Post automation alerts",
    n8nName: "Kit - Slack",
  },
  {
    id: "sheets",
    label: "Google Sheets",
    description: "Update processed rows",
    n8nName: "Kit - Google Sheets",
  },
  {
    id: "sheets-trigger",
    label: "Sheets Trigger",
    description: "Watch for new sheet rows",
    n8nName: "Kit - Google Sheets Trigger",
  },
  {
    id: "llm",
    label: "Gemini LLM",
    description: "Generate AI summaries",
    n8nName: "Kit - LLM",
  },
] as const;
