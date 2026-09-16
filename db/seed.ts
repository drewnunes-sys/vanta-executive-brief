import { config } from "dotenv";
import { db } from "./index";
import { organizations } from "./schema";

config({ path: ".env.local" });

async function main() {
  await db
    .insert(organizations)
    .values({
      name: "Demo Organization",
      slug: "demo-org",
    })
    .onConflictDoNothing();

  console.log("Seed completed");
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
