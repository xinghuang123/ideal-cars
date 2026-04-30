import { Client } from "pg";
import { readFileSync } from "fs";
import { resolve } from "path";

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: tsx scripts/run-migration.ts <path-to-sql-file>");
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  const sql = readFileSync(resolve(file), "utf8");
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  console.log(`Running ${file}...`);
  await client.query(sql);
  console.log("Done.");
  await client.end();
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
