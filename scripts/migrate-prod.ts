/**
 * One-shot production migration script.
 * Uses @libsql/client directly (supports libsql:// Turso URLs)
 * because the Prisma CLI only supports file: scheme for SQLite.
 *
 * Run with production env vars:
 *   vercel env run --environment=production -- npx tsx scripts/migrate-prod.ts
 */

import { createClient } from "@libsql/client";

async function migrate() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌  DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("Connecting to:", url.replace(/authToken=[^&]+/, "authToken=***"));

  const client = createClient({ url });

  // ── Review table ──────────────────────────────────────────────────────────
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "Review" (
      "id"         TEXT     NOT NULL PRIMARY KEY,
      "reviewerId" TEXT     NOT NULL,
      "reviewedId" TEXT     NOT NULL,
      "rating"     INTEGER  NOT NULL,
      "comment"    TEXT,
      "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Review_reviewerId_fkey"
        FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Review_reviewedId_fkey"
        FOREIGN KEY ("reviewedId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  console.log("✓  Review table ready");

  await client.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Review_reviewerId_reviewedId_key"
    ON "Review" ("reviewerId", "reviewedId")
  `);
  console.log("✓  Review unique index ready");

  // ── Report table ──────────────────────────────────────────────────────────
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "Report" (
      "id"         TEXT     NOT NULL PRIMARY KEY,
      "reporterId" TEXT     NOT NULL,
      "reportedId" TEXT     NOT NULL,
      "reason"     TEXT     NOT NULL,
      "details"    TEXT,
      "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "resolved"   BOOLEAN  NOT NULL DEFAULT FALSE,
      CONSTRAINT "Report_reporterId_fkey"
        FOREIGN KEY ("reporterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Report_reportedId_fkey"
        FOREIGN KEY ("reportedId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  console.log("✓  Report table ready");

  console.log("\n✅  Migration complete — Report and Review tables are live.");
  client.close();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
