import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { organizations, snapshots, syncRuns, testResults } from "@/db/schema";
import { logError, logInfo } from "@/lib/logger";
import { getAllVantaTests } from "@/lib/vanta";

export async function syncVantaData(initiatedByEmail?: string) {
  const slug = process.env.APP_ORG_SLUG ?? "demo-org";
  const startedAt = Date.now();
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1);

  if (!organization) throw new Error(`Organization ${slug} was not found`);

  const [existingRun] = await db
    .select()
    .from(syncRuns)
    .where(and(eq(syncRuns.organizationId, organization.id), eq(syncRuns.status, "RUNNING")))
    .limit(1);

  if (existingRun) throw new Error("A sync is already running");

  const [run] = await db
    .insert(syncRuns)
    .values({
      organizationId: organization.id,
      status: "RUNNING",
      initiatedByEmail,
    })
    .returning();

  if (!run) throw new Error("Failed to create sync run");

  logInfo("sync_started", { syncRunId: run.id, initiatedByEmail });

  try {
    const tests = await getAllVantaTests();
    const inScope = tests.filter(
      (test) => !["DEACTIVATED", "NOT_APPLICABLE"].includes(test.status),
    );
    const passing = tests.filter((test) => test.status === "OK").length;
    const failing = tests.filter((test) => test.status === "NEEDS_ATTENTION").length;
    const overdueItems = tests.reduce((total, test) => {
      if (test.remediationStatusInfo?.status !== "OVERDUE") return total;
      return total + (test.remediationStatusInfo.itemCount ?? 1);
    }, 0);
    const passRate = inScope.length === 0 ? 0 : (passing / inScope.length) * 100;

    const [snapshot] = await db
      .insert(snapshots)
      .values({
        organizationId: organization.id,
        syncRunId: run.id,
        totalTests: inScope.length,
        passingTests: passing,
        failingTests: failing,
        overdueItems,
        passRate,
      })
      .returning();

    if (!snapshot) throw new Error("Failed to create snapshot");

    if (tests.length > 0) {
      await db.insert(testResults).values(
        tests.map((test) => ({
          snapshotId: snapshot.id,
          vantaTestId: test.id,
          name: test.name,
          status: test.status,
          category: test.category,
          ownerName: test.owner?.displayName,
          lastTestRunDate: test.lastTestRunDate ? new Date(test.lastTestRunDate) : null,
          raw: test,
        })),
      );
    }

    logInfo("snapshot_saved", { syncRunId: run.id, snapshotId: snapshot.id });

    await db
      .update(syncRuns)
      .set({
        status: "SUCCEEDED",
        recordsFetched: tests.length,
        durationMs: Date.now() - startedAt,
        completedAt: new Date(),
      })
      .where(eq(syncRuns.id, run.id));

    logInfo("sync_succeeded", {
      syncRunId: run.id,
      recordsFetched: tests.length,
      durationMs: Date.now() - startedAt,
    });

    return snapshot;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    await db
      .update(syncRuns)
      .set({
        status: "FAILED",
        errorMessage: message,
        durationMs: Date.now() - startedAt,
        completedAt: new Date(),
      })
      .where(eq(syncRuns.id, run.id));

    logError("sync_failed", error, { syncRunId: run.id });
    throw error;
  }
}
