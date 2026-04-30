import { Client } from "pg";
import { embed, toPgVector } from "../src/lib/embeddings";

async function search(client: Client, query: string) {
  console.log(`\n>>> Query: "${query}"`);
  const vec = await embed(query);
  const { rows } = await client.query(
    `SELECT year, make, model, price::float, mileage, body_type, colour,
            similarity::float
     FROM match_vehicles($1::vector, 5, 0.0, false)`,
    [toPgVector(vec)],
  );
  for (const r of rows) {
    console.log(
      `   ${(r.similarity * 100).toFixed(1)}%  ${r.year} ${r.make} ${r.model}  ` +
        `(${r.body_type}, ${r.colour}, ${r.mileage.toLocaleString("en-NZ")} km, $${r.price.toLocaleString("en-NZ")})`,
    );
  }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  await search(client, "red SUV under 20k with low mileage");
  await search(client, "fuel efficient hatchback for the city");
  await search(client, "ute for tradies with 4WD");
  await search(client, "family car with seven seats");

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
