import { AuthButtons } from "@/components/auth-buttons";
import { AppShell, AuthGate } from "@/components/app-shell";
import { GenerateBriefButton } from "@/components/generate-brief-button";
import { SyncButton } from "@/components/sync-button";
import { getDashboardData } from "@/lib/dashboard";
import { requireMembership } from "@/lib/authorization";
import { formatAge, formatDateTime, formatDelta } from "@/lib/format";
import { errorMessage } from "@/lib/http";
import Link from "next/link";

export const dynamic = "force-dynamic";

function changeClass(change: string, positiveIsGood: boolean) {
  if (change === "n/a") return "text-vanta-muted";
  const numeric = Number(change.replace("%", ""));
  if (!Number.isNaN(numeric) && numeric === 0) return "text-vanta-muted";
  const up = change.startsWith("+");
  const good = positiveIsGood ? up : !up;
  return good ? "text-vanta-pass" : "text-vanta-alert";
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
      <AuthGate
        title="Sign in required"
        body="Sign in with GitHub to view the executive security briefing."
      />
    );
  }
  if (accessError === "FORBIDDEN") {
    return (
      <AuthGate
        title="Access denied"
        body="Your GitHub account is signed in, but it does not have a membership for this organization."
      />
    );
  }
  if (accessError === "ORGANIZATION_NOT_FOUND") {
    return (
      <AuthGate
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
      positiveIsGood: true,
    },
    {
      label: "Passing tests",
      value: latest ? String(latest.passingTests) : "No data",
      change: latest ? formatDelta(latest.passingTests, previous?.passingTests) : "n/a",
      positiveIsGood: true,
    },
    {
      label: "Needs attention",
      value: latest ? String(latest.failingTests) : "No data",
      change: latest ? formatDelta(latest.failingTests, previous?.failingTests) : "n/a",
      positiveIsGood: false,
    },
    {
      label: "Overdue items",
      value: latest ? String(latest.overdueItems) : "No data",
      change: latest ? formatDelta(latest.overdueItems, previous?.overdueItems) : "n/a",
      positiveIsGood: false,
    },
  ];

  return (
    <AppShell
      actions={
        <>
          {membership.role === "ADMIN" ? (
            <Link href="/admin/operations" className="text-sm font-medium text-vanta-mid hover:text-vanta-purple">
              Operations
            </Link>
          ) : null}
          <AuthButtons />
        </>
      }
    >
      <div className="rounded-2xl bg-vanta-wash px-6 py-8 md:px-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-vanta-indigo uppercase">
          {data?.organization.name ?? "Demo organization"}
        </p>
        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-vanta-indigo md:text-4xl">
              Executive Risk Briefing
            </h1>
            <p className="mt-3 text-vanta-muted">
              {latest ? `Last synced ${formatDateTime(latest.capturedAt)}` : "No Vanta snapshot yet"}
            </p>
          </div>
          {canSync ? <SyncButton /> : null}
        </div>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-vanta-border bg-white p-5">
            <p className="text-sm text-vanta-muted">{metric.label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-3xl font-semibold tracking-tight text-vanta-indigo">{metric.value}</p>
              <p className={`text-sm font-medium ${changeClass(metric.change, metric.positiveIsGood)}`}>
                {metric.change}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-vanta-border bg-white p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-vanta-indigo">Top tests needing attention</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-vanta-muted">
                <tr>
                  <th className="pb-3 font-medium">Test</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Owner</th>
                  <th className="pb-3 font-medium">Age</th>
                </tr>
              </thead>
              <tbody>
                {data?.failing.length ? (
                  data.failing.map((test) => (
                    <tr key={test.id} className="border-t border-vanta-border">
                      <td className="py-4 font-medium text-vanta-ink">{test.name}</td>
                      <td className="py-4 text-vanta-muted">{test.category ?? "Uncategorized"}</td>
                      <td className="py-4 text-vanta-muted">{test.ownerName ?? "Unassigned"}</td>
                      <td className="py-4 text-vanta-alert">{formatAge(test.lastTestRunDate)}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-vanta-border">
                    <td className="py-4 text-vanta-muted" colSpan={4}>
                      No failing tests in the latest snapshot.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-vanta-border bg-white p-6">
          <p className="text-xs font-semibold tracking-[0.16em] text-vanta-mid uppercase">AI brief</p>
          <h2 className="mt-2 text-lg font-semibold text-vanta-indigo">Executive summary</h2>
          <p className="mt-4 leading-7 whitespace-pre-wrap text-vanta-muted">
            {data?.brief?.content ?? "No executive brief has been generated for this snapshot."}
          </p>
          {latest ? <GenerateBriefButton snapshotId={latest.id} /> : null}
        </div>
      </section>
    </AppShell>
  );
}
