import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { memberships, organizations } from "@/db/schema";
import { normalizeEmail } from "@/lib/email";

const DEV_BYPASS_EMAIL = "dev@localhost";

export function isDevAuthBypass() {
  return (
    process.env.NODE_ENV === "development" &&
    (!process.env.AUTH_GITHUB_ID || !process.env.AUTH_GITHUB_SECRET)
  );
}

export async function requireMembership() {
  if (isDevAuthBypass()) {
    return getDevBypassContext();
  }

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

async function getDevBypassContext() {
  const slug = process.env.APP_ORG_SLUG ?? "demo-org";
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1);

  if (!organization) throw new Error("ORGANIZATION_NOT_FOUND");

  const email = DEV_BYPASS_EMAIL;

  return {
    session: {
      user: { email, name: "Local developer" },
    },
    organization,
    membership: {
      id: "00000000-0000-0000-0000-000000000000",
      organizationId: organization.id,
      userEmail: email,
      role: "ADMIN" as const,
      createdAt: new Date(),
    },
    email,
  };
}

export async function requireAdmin() {
  const context = await requireMembership();
  if (context.membership.role !== "ADMIN") throw new Error("FORBIDDEN");
  return context;
}
