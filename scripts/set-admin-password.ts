import { Client } from "pg";

const EMAIL = process.argv[2];
const PASSWORD = process.argv[3];

if (!EMAIL || !PASSWORD) {
  console.error("Usage: tsx scripts/set-admin-password.ts <email> <password>");
  process.exit(1);
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  const result = await client.query(
    `UPDATE auth.users
     SET encrypted_password = crypt($1, gen_salt('bf')),
         updated_at = NOW()
     WHERE email = $2
     RETURNING id, email`,
    [PASSWORD, EMAIL],
  );

  if (result.rowCount === 0) {
    console.error(`No user found with email ${EMAIL}`);
    process.exit(1);
  }
  console.log(`Password updated for ${result.rows[0].email}`);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
