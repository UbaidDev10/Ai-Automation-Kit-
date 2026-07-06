import Link from "next/link";
import { AlertTriangle, BookOpen, CheckCircle2, KeyRound, Plug } from "lucide-react";
import { ConnectAccounts } from "@/components/connect-accounts";
import { PageHeader } from "@/components/page-header";
import { KIT_CREDENTIALS } from "@/lib/kit-config";
import { isN8nConfigError, listKitCredentialStatuses } from "@/lib/n8n";
import type { KitCredentialStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CredentialsPage() {
  let items: KitCredentialStatus[] = KIT_CREDENTIALS.map((kit) => ({
    id: kit.id,
    label: kit.label,
    description: kit.description,
    n8nName: kit.n8nName,
    connected: false,
    credentialId: null,
    credentialType: null,
    updatedAt: null,
  }));
  let connectedCount = 0;
  let loadError: string | null = null;

  try {
    const result = await listKitCredentialStatuses();
    items = result.items;
    connectedCount = result.connectedCount;
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unknown error";
    if (isN8nConfigError(error)) {
      return (
        <div className="space-y-6">
          <PageHeader
            title="Credentials"
            description="Connect every integration your automation kit needs."
          />
          <div className="kit-panel p-6">
            <div className="flex gap-4">
              <div className="kit-icon-box kit-icon-box--error h-12 w-12 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-kit-text">Dashboard not configured</h1>
                <p className="mt-1 text-sm text-kit-muted">{loadError}</p>
                <p className="mt-2 text-sm text-kit-muted">
                  Run <code>.\scripts\setup-dashboard.ps1</code> from the project root.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  const allConnected = connectedCount === KIT_CREDENTIALS.length;

  return (
    <div className="space-y-10">
      <PageHeader
        title="Credentials"
        description="Status is read from n8n. Connected integrations show a green badge — click Manage to edit in the n8n editor."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <HeroStat
          icon={Plug}
          value={`${connectedCount}/${KIT_CREDENTIALS.length}`}
          label="Connected"
          sub={allConnected ? "All kit credentials found in n8n" : "Missing credentials need setup in n8n"}
          tone={allConnected ? "success" : connectedCount > 0 ? "warning" : "neutral"}
        />
        <HeroStat
          icon={KeyRound}
          value="n8n"
          label="Managed in"
          sub="OAuth and API keys live in n8n"
          tone="neutral"
        />
        <HeroStat
          icon={BookOpen}
          value="Guide"
          label="Setup docs"
          sub="See n8n/CREDENTIALS.md"
          tone="neutral"
        />
      </div>

      {!loadError && !allConnected && (
        <div className="kit-panel border-l-4 border-l-amber-500 p-4 text-sm text-kit-muted">
          Some credentials were not found in n8n. Names must match exactly (e.g.{" "}
          <code>Kit - Gmail</code>). Use <strong>Set up</strong> on each card or see{" "}
          <code>n8n/CREDENTIALS.md</code>.
        </div>
      )}

      {!loadError && allConnected && (
        <div className="kit-panel flex items-center gap-3 border-l-4 border-l-emerald-500 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-kit-success-text" />
          <p className="text-sm text-kit-text">
            All {KIT_CREDENTIALS.length} kit credentials are saved in n8n. Run{" "}
            <Link href="/workflows" className="kit-link">
              Kit Credential Tests
            </Link>{" "}
            from Workflows to verify they work.
          </p>
        </div>
      )}

      <section>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-kit-text">Integrations</h2>
          <p className="mt-1 text-sm text-kit-muted">
            Each card maps to one n8n credential. Connected cards open the credential editor;
            missing ones open the credentials list to create it.
          </p>
        </div>
        <ConnectAccounts items={items} loadError={loadError} />
      </section>
    </div>
  );
}

function HeroStat({
  icon: Icon,
  value,
  label,
  sub,
  tone = "neutral",
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  sub: string;
  tone?: "neutral" | "success" | "warning";
}) {
  const iconClass =
    tone === "success"
      ? "kit-icon-box--success"
      : tone === "warning"
        ? "kit-icon-box--warning"
        : "kit-icon-box--accent";

  return (
    <div className="kit-card flex items-center gap-4 p-5">
      <div className={`kit-icon-box h-12 w-12 rounded-xl ${iconClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums text-kit-text">{value}</p>
        <p className="text-sm font-medium text-kit-text">{label}</p>
        <p className="text-xs text-kit-muted">{sub}</p>
      </div>
    </div>
  );
}
