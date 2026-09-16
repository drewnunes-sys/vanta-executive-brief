import {
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["ADMIN", "CISO", "VIEWER"]);
export const syncStatusEnum = pgEnum("sync_status", ["RUNNING", "SUCCEEDED", "FAILED"]);

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const appUsers = pgTable(
  "app_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("app_users_email_idx").on(table.email)],
);

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userEmail: text("user_email").notNull(),
    role: roleEnum("role").default("VIEWER").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("membership_org_email_idx").on(table.organizationId, table.userEmail)],
);

export const syncRuns = pgTable("sync_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  status: syncStatusEnum("status").default("RUNNING").notNull(),
  recordsFetched: integer("records_fetched").default(0).notNull(),
  errorMessage: text("error_message"),
  initiatedByEmail: text("initiated_by_email"),
  durationMs: integer("duration_ms"),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const snapshots = pgTable("snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  syncRunId: uuid("sync_run_id")
    .notNull()
    .references(() => syncRuns.id, { onDelete: "cascade" }),
  totalTests: integer("total_tests").notNull(),
  passingTests: integer("passing_tests").notNull(),
  failingTests: integer("failing_tests").notNull(),
  overdueItems: integer("overdue_items").notNull(),
  passRate: doublePrecision("pass_rate").notNull(),
  capturedAt: timestamp("captured_at", { withTimezone: true }).defaultNow().notNull(),
});

export const testResults = pgTable("test_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  snapshotId: uuid("snapshot_id")
    .notNull()
    .references(() => snapshots.id, { onDelete: "cascade" }),
  vantaTestId: text("vanta_test_id").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull(),
  category: text("category"),
  ownerName: text("owner_name"),
  lastTestRunDate: timestamp("last_test_run_date", { withTimezone: true }),
  raw: jsonb("raw").notNull(),
});

export const executiveBriefs = pgTable("executive_briefs", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  snapshotId: uuid("snapshot_id")
    .notNull()
    .references(() => snapshots.id, { onDelete: "cascade" }),
  createdByEmail: text("created_by_email").notNull(),
  model: text("model").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
