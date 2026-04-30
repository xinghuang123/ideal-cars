import { Client } from "pg";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  const { rows } = await client.query(
    `SELECT column_name, data_type, udt_name, character_maximum_length
     FROM information_schema.columns
     WHERE table_name='vehicles'
     ORDER BY ordinal_position`,
  );
  console.table(rows);

  await client.end();
}

main().catch(console.error);
