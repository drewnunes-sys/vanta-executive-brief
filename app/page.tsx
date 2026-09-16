import { AuthButtons } from "@/components/auth-buttons";
import { GenerateBriefButton } from "@/components/generate-brief-button";
import { SyncButton } from "@/components/sync-button";
import { getDashboardData } from "@/lib/dashboard";
import { requireMembership } from "@/lib/authorization";
import { formatAge, formatDateTime, formatDelta } from "@/lib/format";
import { errorMessage } from "@/lib/http";
import Link from "next/link";

export const dynamic = "force-dynamic";

function Gate({ title, body }: { title: string; body: string }) {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-xl rounded-xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-slate-300">{body}</p>
        <div className="mt-6">
          <AuthButtons />
        </div>
      </div>
    </main>
  );
}

export default async function Home() {
  let membership;
  let accessError: string | null = null;
  try {
    ({ membership } = await requireMembership());
  } catch (error) {
    accessError = errorMessage(error);
  }

  if (accessError === "UNAUTHENTICATED") {
    return (
      <Gate
        title="Sign in required"
        body="Sign in with GitHub to view the executive security briefing."
      />
    );
  }
  if (accessError === "FORBIDDEN") {
    return (
      <Gate
        title="Access denied"
        body="Your GitHub account is signed in, but it does not have a membership for this organization."
      />
    );
  }
  if (accessError === "ORGANIZATION_NOT_FOUND") {
    return (
      <Gate
        title="Organization not found"
        body="The configured demo organization is missing. Run the database seed and try again."
      />
    );
  }
  if (accessError) {
    throw new Error(accessError);
  }
  if (!membership) {
    throw new Error("UNAUTHENTICATED");
  }

  const data = await getDashboardData();
  const latest = data?.latest;
  const previous = data?.previous;
  const canSync = membership.role === "ADMIN";
  const metrics = [
    {
      label: "Test pass rate",
      value: latest ? `${latest.passRate.toFixed(1)}%` : "No data",
      change: latest ? formatDelta(latest.passRate, previous?.passRate, 1, "%") : "n/a",
    },
    {
      label: "Passing tests",
      value: latest ? String(latest.passingTests) : "No data",
      change: latest ? formatDelta(latest.passingTests, previous?.passingTests) : "n/a",
    },
    {
      label: "Needs attention",
      value: latest ? String(latest.failingTests) : "No data",
      change: latest ? formatDelta(latest.failingTests, previous?.failingTests) : "n/a",
    },
    {
      label: "Overdue items",
      value: latest ? String(latest.overdueItems) : "No data",
      change: latest ? formatDelta(latest.overdueItems, previous?.overdueItems) : "n/a",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-emerald-400">
              {data?.organization.name.toUpperCase() ?? "DEMO ORGANIZATION"}
            </p>
            <h1 className="mt-2 text-4xl font-bold">Executive Risk Briefing</h1>
            <p className="mt-3 text-slate-300">
              {latest ? `Last synced ${formatDateTime(latest.capturedAt)}` : "No Vanta snapshot yet"}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <AuthButtons />
            {canSync ? <SyncButton /> : null}
            {membership.role === "ADMIN" ? (
              <Link href="/admin/operations" className="text-sm text-slate-400 underline">
                Operations
              </Link>
            ) : null}
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">{metric.label}</p>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-bold">{metric.value}</p>
                <p className="text-sm text-emerald-400">{metric.change}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold">Top tests needing attention</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="pb-3">Test</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Owner</th>
                    <th className="pb-3">Age</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.failing.length ? (
                    data.failing.map((test) => (
                      <tr key={test.id} className="border-t border-slate-800">
                        <td className="py-4 font-medium">{test.name}</td>
                        <td className="py-4 text-slate-300">{test.category ?? "Uncategorized"}</td>
                        <td className="py-4 text-slate-300">{test.ownerName ?? "Unassigned"}</td>
                        <td className="py-4 text-amber-300">{formatAge(test.lastTestRunDate)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-t border-slate-800">
                      <td className="py-4 text-slate-400" colSpan={4}>
                        No failing tests in the latest snapshot.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm font-semibold text-violet-400">AI BRIEF</p>
            <h2 className="mt-2 text-xl font-semibold">Executive summary</h2>
            <p className="mt-4 leading-7 whitespace-pre-wrap text-slate-300">
              {data?.brief?.content ?? "No executive brief has been generated for this snapshot."}
            </p>
            {latest ? <GenerateBriefButton snapshotId={latest.id} /> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
