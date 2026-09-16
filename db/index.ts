import { drizzle } from "drizzle-orm/neon-http";

type Database = ReturnType<typeof drizzle>;

let cached: Database | undefined;

export function getDb(): Database {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not configured");
    }
    cached = drizzle(url);
  }

  return cached;
}

export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const client = getDb();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
