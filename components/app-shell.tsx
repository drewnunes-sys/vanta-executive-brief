import Link from "next/link";
import { AuthButtons } from "@/components/auth-buttons";
import { VantaMark } from "@/components/vanta-mark";

export function AppShell({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-vanta-canvas text-vanta-ink">
      <header className="border-b border-vanta-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <VantaMark />
            <span className="text-lg font-semibold tracking-tight text-vanta-indigo">Vanta</span>
            <span className="hidden text-sm text-vanta-muted sm:inline">Executive Briefing</span>
          </Link>
          {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8 md:py-10">{children}</main>
    </div>
  );
}

export function AuthGate({ title, body }: { title: string; body: string }) {
  return (
    <AppShell actions={<AuthButtons />}>
      <div className="mx-auto max-w-xl rounded-2xl border border-vanta-border bg-white p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-vanta-indigo">{title}</h1>
        <p className="mt-3 leading-6 text-vanta-muted">{body}</p>
      </div>
    </AppShell>
  );
}
