"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  ListTree,
  Workflow,
  GitBranch,
  ChevronRight,
} from "lucide-react";
import { N8N_UI_URL } from "@/lib/kit-config";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/workflows", label: "Workflows", icon: GitBranch },
  { href: "/runs", label: "Runs", icon: ListTree },
  { href: "/credentials", label: "Credentials", icon: KeyRound },
];

export function KitShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = nav.find((item) =>
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-kit-bg">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] flex-col border-r border-kit-sidebar-border bg-kit-sidebar-bg lg:flex">
        <div className="flex h-[57px] shrink-0 items-center border-b border-kit-sidebar-border px-5">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-kit-sidebar-active shadow-md shadow-blue-900/30">
              <Workflow className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-kit-sidebar-text">
                Automation Kit
              </p>
              <p className="text-[10px] tracking-wide text-kit-sidebar-muted uppercase">
                n8n Operations
              </p>
            </div>
          </Link>
        </div>

        <nav className="shrink-0 space-y-0.5 px-3 py-5">
          <p className="mb-2 px-3 text-[10px] font-semibold tracking-widest text-kit-sidebar-muted uppercase">
            Menu
          </p>
          {nav.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <div className="mt-auto shrink-0 border-t border-kit-sidebar-border p-3">
          <a
            href={N8N_UI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-kit-sidebar-muted transition hover:bg-kit-sidebar-hover hover:text-kit-sidebar-text"
          >
            <span className="flex items-center gap-2.5">
              <ExternalLink className="h-4 w-4" />
              Open n8n editor
            </span>
            <ChevronRight className="h-4 w-4 opacity-40" />
          </a>
          <p className="mt-2 px-3 text-[10px] text-kit-sidebar-muted/70">
            AI Automation Kit v1.0
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:ml-[280px]">
        <header className="flex h-[57px] shrink-0 items-center border-b border-kit-sidebar-border bg-kit-sidebar-bg px-4 sm:px-6 lg:px-8">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-kit-sidebar-active text-white lg:hidden">
                <Workflow className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-kit-sidebar-text lg:text-[15px]">
                  {current?.label ?? "Dashboard"}
                </p>
                <p className="hidden text-xs text-kit-sidebar-muted sm:block">
                  AI Automation Kit
                </p>
              </div>
            </div>
            <nav className="flex shrink-0 gap-1 overflow-x-auto lg:hidden">
              {nav.map((item) => (
                <NavLink key={item.href} {...item} compact />
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  compact,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const active =
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  if (compact) {
    return (
      <Link
        href={href}
        className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
          active
            ? "bg-kit-sidebar-active text-white"
            : "text-kit-sidebar-muted hover:bg-kit-sidebar-hover hover:text-kit-sidebar-text"
        }`}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${
        active
          ? "bg-kit-sidebar-hover text-kit-sidebar-text"
          : "text-kit-sidebar-muted hover:bg-kit-sidebar-hover/60 hover:text-kit-sidebar-text"
      }`}
    >
      {active && (
        <span className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-kit-sidebar-active" />
      )}
      <Icon
        className={`h-[17px] w-[17px] shrink-0 ${active ? "text-kit-sidebar-text" : "text-kit-sidebar-muted"}`}
      />
      {label}
    </Link>
  );
}
