import { Client } from "pg";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  const { rows } = await client.query(
    `SELECT id, email, created_at, last_sign_in_at,
            email_confirmed_at, raw_app_meta_data
     FROM auth.users
     ORDER BY created_at DESC`,
  );

  console.log(`Found ${rows.length} user(s):\n`);
  for (const r of rows) {
    console.log(`  email:           ${r.email}`);
    console.log(`  id:              ${r.id}`);
    console.log(`  created:         ${r.created_at}`);
    console.log(`  email confirmed: ${r.email_confirmed_at ?? "NO"}`);
    console.log(`  last sign in:    ${r.last_sign_in_at ?? "never"}`);
    console.log(`  app_metadata:    ${JSON.stringify(r.raw_app_meta_data)}`);
    console.log("");
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
