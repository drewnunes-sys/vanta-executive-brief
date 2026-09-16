import OpenAI from "openai";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { executiveBriefs, snapshots, testResults } from "@/db/schema";
import { logError, logInfo } from "@/lib/logger";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

export async function generateExecutiveBrief(input: {
  organizationId: string;
  snapshotId: string;
  createdByEmail: string;
}) {
  logInfo("brief_generation_started", {
    snapshotId: input.snapshotId,
    createdByEmail: input.createdByEmail,
  });

  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const [snapshot] = await db
      .select()
      .from(snapshots)
      .where(eq(snapshots.id, input.snapshotId))
      .limit(1);

    if (!snapshot || snapshot.organizationId !== input.organizationId) {
      throw new Error("Snapshot not found");
    }

    const failing = await db
      .select({
        name: testResults.name,
        category: testResults.category,
        ownerName: testResults.ownerName,
        lastTestRunDate: testResults.lastTestRunDate,
      })
      .from(testResults)
      .where(eq(testResults.snapshotId, snapshot.id))
      .orderBy(desc(testResults.lastTestRunDate))
      .limit(10);

    const verifiedData = {
      capturedAt: snapshot.capturedAt,
      totalTests: snapshot.totalTests,
      passingTests: snapshot.passingTests,
      failingTests: snapshot.failingTests,
      overdueItems: snapshot.overdueItems,
      passRate: Number(snapshot.passRate.toFixed(1)),
      topFailingTests: failing,
    };

    const response = await openai.responses.create({
      model: MODEL,
      instructions: [
        "You write concise executive security briefings for a CISO.",
        "Use only the verified JSON supplied by the application.",
        "Never invent numbers, causes, trends, deadlines, or recommendations that are not supported.",
        "Write three short sections: Current posture, Priority issues, Recommended next actions.",
        "State when the available data is insufficient to determine a trend.",
      ].join(" "),
      input: JSON.stringify(verifiedData),
      max_output_tokens: 500,
    });

    const content = response.output_text;
    if (!content) throw new Error("OpenAI returned an empty brief");

    const [brief] = await db
      .insert(executiveBriefs)
      .values({
        organizationId: input.organizationId,
        snapshotId: snapshot.id,
        createdByEmail: input.createdByEmail,
        model: MODEL,
        content,
      })
      .returning();

    logInfo("brief_generation_succeeded", {
      snapshotId: snapshot.id,
      briefId: brief?.id,
      model: MODEL,
    });

    return brief;
  } catch (error) {
    logError("brief_generation_failed", error, { snapshotId: input.snapshotId });
    throw error;
  }
}
