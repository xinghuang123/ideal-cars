import { Client } from "pg";
import { embed, vehicleEmbeddingText, toPgVector } from "../src/lib/embeddings";

interface Row {
  id: string;
  year: number;
  make: string;
  model: string;
  body_type: string | null;
  fuel_type: string | null;
  transmission: string | null;
  drive_type: string | null;
  colour: string | null;
  engine_size: string | null;
  mileage: number | null;
  price: number | null;
  description: string | null;
  features: string[] | null;
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  const onlyMissing = process.argv.includes("--only-missing");
  const filter = onlyMissing ? "WHERE embedding IS NULL" : "";

  const { rows } = await client.query<Row>(`
    SELECT id, year, make, model, body_type, fuel_type, transmission,
           drive_type, colour, engine_size, mileage, price::float, description, features
    FROM vehicles
    ${filter}
  `);

  console.log(`Embedding ${rows.length} vehicle(s)...`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const text = vehicleEmbeddingText(row);
    const vec = await embed(text);

    await client.query(
      `UPDATE vehicles
         SET embedding = $1::vector,
             embedding_text = $2,
             embedding_updated_at = NOW()
       WHERE id = $3`,
      [toPgVector(vec), text, row.id],
    );

    console.log(
      `  [${i + 1}/${rows.length}] ${row.year} ${row.make} ${row.model}`,
    );
  }

  await client.end();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
