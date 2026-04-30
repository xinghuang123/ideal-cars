import { Client } from "pg";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  const ext = await client.query(
    "SELECT extname FROM pg_extension WHERE extname='vector'",
  );
  console.log("pgvector extension:", ext.rows);

  const cols = await client.query(
    "SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name='vehicles' AND column_name LIKE 'embedding%'",
  );
  console.log("embedding columns on vehicles:", cols.rows);

  const fn = await client.query(
    "SELECT proname FROM pg_proc WHERE proname='match_vehicles'",
  );
  console.log("match_vehicles function:", fn.rows);

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
