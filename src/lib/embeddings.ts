import { pipeline, env, type FeatureExtractionPipeline } from "@xenova/transformers";

// Use cached models on disk between invocations. On Vercel this is /tmp;
// the model downloads once per cold start (~22 MB).
env.cacheDir = process.env.TRANSFORMERS_CACHE ?? "/tmp/transformers-cache";
// Quantised model is faster and smaller; quality drop is negligible for
// short product-style text.
env.useFSCache = true;

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
      { quantized: true },
    ) as Promise<FeatureExtractionPipeline>;
  }
  return extractorPromise;
}

/**
 * Generates a 384-dimensional unit-normalised embedding for the given text
 * using all-MiniLM-L6-v2 running locally in this Node process.
 */
export async function embed(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

/**
 * Builds the canonical text representation of a vehicle that gets embedded.
 * Keep this stable — changes invalidate all existing embeddings.
 */
export function vehicleEmbeddingText(v: {
  year: number;
  make: string;
  model: string;
  body_type?: string | null;
  fuel_type?: string | null;
  transmission?: string | null;
  drive_type?: string | null;
  colour?: string | null;
  engine_size?: string | null;
  mileage?: number | null;
  price?: number | null;
  description?: string | null;
  features?: string[] | null;
}): string {
  const parts: string[] = [];
  parts.push(`${v.year} ${v.make} ${v.model}`);
  if (v.body_type) parts.push(`Body: ${v.body_type}`);
  if (v.colour) parts.push(`Colour: ${v.colour}`);
  if (v.fuel_type) parts.push(`Fuel: ${v.fuel_type}`);
  if (v.transmission) parts.push(`Transmission: ${v.transmission}`);
  if (v.drive_type) parts.push(`Drive: ${v.drive_type}`);
  if (v.engine_size) parts.push(`Engine: ${v.engine_size}`);
  if (typeof v.mileage === "number") {
    parts.push(`Mileage: ${v.mileage.toLocaleString("en-NZ")} km`);
  }
  if (typeof v.price === "number") {
    parts.push(`Price: NZD $${v.price.toLocaleString("en-NZ")}`);
  }
  if (v.features && v.features.length > 0) {
    parts.push(`Features: ${v.features.join(", ")}`);
  }
  if (v.description) parts.push(v.description);
  return parts.join(". ");
}

/** Postgres vector literal for direct insert via pg-style queries. */
export function toPgVector(v: number[]): string {
  return `[${v.join(",")}]`;
}
