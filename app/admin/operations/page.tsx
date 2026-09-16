import Link from "next/link";
import { desc } from "drizzle-orm";
import { AuthButtons } from "@/components/auth-buttons";
import { AppShell, AuthGate } from "@/components/app-shell";
import { db } from "@/db";
import { syncRuns } from "@/db/schema";
import { requireAdmin } from "@/lib/authorization";
import { formatDateTime } from "@/lib/format";
import { errorMessage } from "@/lib/http";

export const dynamic = "force-dynamic";

function statusClass(status: string) {
  if (status === "SUCCEEDED") return "bg-emerald-50 text-vanta-pass";
  if (status === "FAILED") return "bg-orange-50 text-vanta-alert";
  return "bg-vanta-wash text-vanta-purple";
}

export default async function OperationsPage() {
  let accessError: string | null = null;
  try {
    await requireAdmin();
  } catch (error) {
    accessError = errorMessage(error);
  }

  if (accessError) {
    return (
      <AuthGate
        title={accessError === "UNAUTHENTICATED" ? "Sign in required" : "Access denied"}
        body="Only organization admins can view sync operations."
      />
    );
  }

  const runs = await db.select().from(syncRuns).orderBy(desc(syncRuns.startedAt)).limit(25);

  return (
    <AppShell
      actions={
        <>
          <Link href="/" className="text-sm font-medium text-vanta-mid hover:text-vanta-purple">
            Dashboard
          </Link>
          <AuthButtons />
        </>
      }
    >
      <div className="rounded-2xl bg-vanta-wash px-6 py-8 md:px-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-vanta-indigo uppercase">Admin</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-vanta-indigo md:text-4xl">
          Sync operations
        </h1>
        <p className="mt-3 text-vanta-muted">Most recent 25 Vanta sync runs</p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-vanta-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="text-vanta-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Started</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Records</th>
              <th className="px-4 py-3 font-medium">Initiated by</th>
              <th className="px-4 py-3 font-medium">Error</th>
            </tr>
          </thead>
          <tbody>
            {runs.length === 0 ? (
              <tr className="border-t border-vanta-border">
                <td className="px-4 py-4 text-vanta-muted" colSpan={6}>
                  No sync runs yet.
                </td>
              </tr>
            ) : (
              runs.map((run) => (
                <tr key={run.id} className="border-t border-vanta-border">
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(run.status)}`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-vanta-muted">{formatDateTime(run.startedAt)}</td>
                  <td className="px-4 py-4 text-vanta-muted">
                    {run.durationMs == null ? "n/a" : `${run.durationMs} ms`}
                  </td>
                  <td className="px-4 py-4 text-vanta-muted">{run.recordsFetched}</td>
                  <td className="px-4 py-4 text-vanta-muted">{run.initiatedByEmail ?? "Unknown"}</td>
                  <td className="px-4 py-4 text-vanta-alert">{run.errorMessage ?? ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
