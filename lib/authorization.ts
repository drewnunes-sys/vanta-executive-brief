import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { memberships, organizations } from "@/db/schema";
import { normalizeEmail } from "@/lib/email";

export async function requireMembership() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("UNAUTHENTICATED");
  const email = normalizeEmail(session.user.email);

  const slug = process.env.APP_ORG_SLUG ?? "demo-org";
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1);

  if (!organization) throw new Error("ORGANIZATION_NOT_FOUND");

  const [membership] = await db
    .select()
    .from(memberships)
    .where(
      and(eq(memberships.organizationId, organization.id), eq(memberships.userEmail, email)),
    )
    .limit(1);

  if (!membership) throw new Error("FORBIDDEN");
  return { session, organization, membership, email };
}

export async function requireAdmin() {
  const context = await requireMembership();
  if (context.membership.role !== "ADMIN") throw new Error("FORBIDDEN");
  return context;
}
