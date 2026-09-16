import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { executiveBriefs, organizations, snapshots, testResults } from "@/db/schema";

export async function getDashboardData() {
  const slug = process.env.APP_ORG_SLUG ?? "demo-org";
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1);

  if (!organization) return null;

  const recentSnapshots = await db
    .select()
    .from(snapshots)
    .where(eq(snapshots.organizationId, organization.id))
    .orderBy(desc(snapshots.capturedAt))
    .limit(2);

  const latest = recentSnapshots[0];
  const previous = recentSnapshots[1];
  const failing = latest
    ? await db
        .select()
        .from(testResults)
        .where(eq(testResults.snapshotId, latest.id))
        .orderBy(desc(testResults.lastTestRunDate))
    : [];

  const [brief] = latest
    ? await db
        .select()
        .from(executiveBriefs)
        .where(eq(executiveBriefs.snapshotId, latest.id))
        .orderBy(desc(executiveBriefs.createdAt))
        .limit(1)
    : [];

  return {
    organization,
    latest,
    previous,
    brief,
    failing: failing.filter((test) => test.status === "NEEDS_ATTENTION").slice(0, 10),
  };
}
