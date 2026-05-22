#!/usr/bin/env node
export async function withPgClient(dbUrl, fn) {
  const pgMod = await import("pg");
  const pg = pgMod.default ?? pgMod;
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: dbUrl.includes("supabase.co") ? { rejectUnauthorized: false } : undefined,
  });
  try {
    await client.connect();
    return await fn(client);
  } finally {
    await client.end().catch(() => {});
  }
}
