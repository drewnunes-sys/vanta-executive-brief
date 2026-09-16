import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function GET() {
  const startedAt = Date.now();
  try {
    await db.execute(sql`select 1`);
    return Response.json({
      status: "ok",
      database: "reachable",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { status: "error", database: "unreachable", timestamp: new Date().toISOString() },
      { status: 503 },
    );
  }
}
