import {
  CheckCircle2,
  ExternalLink,
  Link2,
  Mail,
  MessageSquare,
  Sheet,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { formatRelative } from "@/lib/format";
import { n8nCredentialUrl, N8N_UI_URL } from "@/lib/kit-config";
import type { KitCredentialStatus } from "@/lib/types";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  gmail: Mail,
  slack: MessageSquare,
  sheets: Sheet,
  "sheets-trigger": Sheet,
  llm: Sparkles,
};

const themes: Record<
  string,
  { strip: string; iconBg: string; iconColor: string; ring: string; button: string; buttonOutline: string }
> = {
  gmail: {
    strip: "bg-[#ea4335]",
    iconBg: "bg-red-50",
    iconColor: "text-[#ea4335]",
    ring: "ring-red-100",
    button: "bg-[#ea4335] hover:bg-[#d33426]",
    buttonOutline: "border-[#ea4335]/30 text-[#ea4335] hover:bg-red-50",
  },
  slack: {
    strip: "bg-[#4A154B]",
    iconBg: "bg-purple-50",
    iconColor: "text-[#4A154B]",
    ring: "ring-purple-100",
    button: "bg-[#4A154B] hover:bg-[#3d1140]",
    buttonOutline: "border-[#4A154B]/30 text-[#4A154B] hover:bg-purple-50",
  },
  sheets: {
    strip: "bg-[#0F9D58]",
    iconBg: "bg-emerald-50",
    iconColor: "text-[#0F9D58]",
    ring: "ring-emerald-100",
    button: "bg-[#0F9D58] hover:bg-[#0d8a4c]",
    buttonOutline: "border-[#0F9D58]/30 text-[#0F9D58] hover:bg-emerald-50",
  },
  "sheets-trigger": {
    strip: "bg-[#4285F4]",
    iconBg: "bg-blue-50",
    iconColor: "text-[#4285F4]",
    ring: "ring-blue-100",
    button: "bg-[#4285F4] hover:bg-[#3367d6]",
    buttonOutline: "border-[#4285F4]/30 text-[#4285F4] hover:bg-blue-50",
  },
  llm: {
    strip: "bg-[#7c3aed]",
    iconBg: "bg-violet-50",
    iconColor: "text-[#7c3aed]",
    ring: "ring-violet-100",
    button: "bg-[#7c3aed] hover:bg-[#6d28d9]",
    buttonOutline: "border-[#7c3aed]/30 text-[#7c3aed] hover:bg-violet-50",
  },
};

export function ConnectAccounts({
  items,
  loadError,
}: {
  items: KitCredentialStatus[];
  loadError?: string | null;
}) {
  return (
    <div className="space-y-8">
      {loadError && (
        <div className="kit-panel flex gap-3 border-l-4 border-l-amber-500 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-kit-warning-text" />
          <div className="text-sm">
            <p className="font-semibold text-kit-text">Could not read credentials from n8n</p>
            <p className="mt-1 text-kit-muted">{loadError}</p>
            <p className="mt-2 text-kit-muted">
              Add <code>credential:read</code> to your n8n API key, or open credentials directly
              in n8n below.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((cred) => {
          const Icon = icons[cred.id] ?? Link2;
          const theme = themes[cred.id] ?? themes.llm;
          const href = n8nCredentialUrl(cred.credentialId);

          return (
            <div
              key={cred.id}
              className="kit-card kit-card-hover flex flex-col overflow-hidden"
            >
              <div className={`h-1.5 w-full ${theme.strip}`} />

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ring-4 ${theme.iconBg} ${theme.iconColor} ${theme.ring}`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  {cred.connected ? (
                    <span className="kit-badge bg-kit-success-bg text-kit-success-text">
                      <CheckCircle2 className="h-3 w-3" />
                      Connected
                    </span>
                  ) : (
                    <span className="kit-badge bg-kit-warning-bg text-kit-warning-text">
                      <AlertCircle className="h-3 w-3" />
                      Not found
                    </span>
                  )}
                </div>

                <h3 className="mt-5 text-lg font-semibold text-kit-text">{cred.label}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-kit-muted">
                  {cred.description}
                </p>

                <div className="mt-4 rounded-lg border border-kit-border bg-kit-surface-raised px-3 py-2.5">
                  <p className="text-[10px] font-semibold tracking-wider text-kit-muted uppercase">
                    n8n credential name
                  </p>
                  <p className="mt-0.5 font-mono text-xs font-medium text-kit-text">
                    {cred.n8nName}
                  </p>
                  {cred.connected && cred.credentialType && (
                    <p className="mt-1.5 text-[11px] text-kit-muted">
                      Type: {cred.credentialType}
                      {cred.updatedAt
                        ? ` · Updated ${formatRelative(cred.updatedAt)}`
                        : ""}
                    </p>
                  )}
                </div>

                <div className="mt-auto pt-6">
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition ${
                      cred.connected
                        ? `border bg-kit-surface ${theme.buttonOutline}`
                        : `text-white ${theme.button}`
                    }`}
                  >
                    {cred.connected ? "Manage in n8n" : `Set up ${cred.label}`}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <a
        href={`${N8N_UI_URL}/home/credentials`}
        target="_blank"
        rel="noopener noreferrer"
        className="kit-card kit-card-hover flex items-center justify-between gap-4 p-5 no-underline"
      >
        <div className="flex items-center gap-4">
          <div className="kit-icon-box kit-icon-box--accent h-12 w-12 rounded-xl">
            <ExternalLink className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-kit-text">Open n8n Credentials</p>
            <p className="mt-0.5 text-sm text-kit-muted">
              Create, edit, or reconnect OAuth and API keys in the n8n editor
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-kit-muted" />
      </a>
    </div>
  );
}
