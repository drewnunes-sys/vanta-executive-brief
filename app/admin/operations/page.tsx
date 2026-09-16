import Link from "next/link";
import { desc } from "drizzle-orm";
import { AuthButtons } from "@/components/auth-buttons";
import { db } from "@/db";
import { syncRuns } from "@/db/schema";
import { requireAdmin } from "@/lib/authorization";
import { formatDateTime } from "@/lib/format";
import { errorMessage } from "@/lib/http";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  let accessError: string | null = null;
  try {
    await requireAdmin();
  } catch (error) {
    accessError = errorMessage(error);
  }

  if (accessError) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
        <div className="mx-auto max-w-xl rounded-xl border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-2xl font-bold">
            {accessError === "UNAUTHENTICATED" ? "Sign in required" : "Access denied"}
          </h1>
          <p className="mt-3 text-slate-300">Only organization admins can view sync operations.</p>
          <div className="mt-6">
            <AuthButtons />
          </div>
        </div>
      </main>
    );
  }

  const runs = await db.select().from(syncRuns).orderBy(desc(syncRuns.startedAt)).limit(25);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-400">ADMIN</p>
            <h1 className="mt-2 text-4xl font-bold">Sync operations</h1>
            <p className="mt-3 text-slate-300">Most recent 25 Vanta sync runs</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-slate-400 underline">
              Dashboard
            </Link>
            <AuthButtons />
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Records</th>
                <th className="px-4 py-3">Initiated by</th>
                <th className="px-4 py-3">Error</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr className="border-t border-slate-800">
                  <td className="px-4 py-4 text-slate-400" colSpan={6}>
                    No sync runs yet.
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.id} className="border-t border-slate-800">
                    <td className="px-4 py-4 font-medium">{run.status}</td>
                    <td className="px-4 py-4 text-slate-300">{formatDateTime(run.startedAt)}</td>
                    <td className="px-4 py-4 text-slate-300">
                      {run.durationMs == null ? "n/a" : `${run.durationMs} ms`}
                    </td>
                    <td className="px-4 py-4 text-slate-300">{run.recordsFetched}</td>
                    <td className="px-4 py-4 text-slate-300">{run.initiatedByEmail ?? "Unknown"}</td>
                    <td className="px-4 py-4 text-amber-300">{run.errorMessage ?? ""}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
