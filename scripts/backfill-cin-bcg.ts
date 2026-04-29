import { Client } from "pg";
import { cars } from "../src/data/cars";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  let updated = 0;
  for (const car of cars) {
    if (!car.cin && !car.bcg) continue;

    const result = await client.query(
      `UPDATE vehicles SET cin = $1, bcg = $2 WHERE stock_number = $3 RETURNING id`,
      [
        car.cin ? JSON.stringify(car.cin) : null,
        car.bcg ? JSON.stringify(car.bcg) : null,
        car.stockNumber,
      ],
    );
    if (result.rowCount && result.rowCount > 0) {
      console.log(`Updated ${car.stockNumber} (${car.year} ${car.make} ${car.model})`);
      updated++;
    } else {
      console.warn(`No row matched stock_number=${car.stockNumber}`);
    }
  }

  console.log(`Done. ${updated} vehicles backfilled.`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
