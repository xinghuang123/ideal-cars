import type { MetadataRoute } from "next";
import { getAvailableVehicles } from "@/lib/vehicles";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://idealcarsltd.co.nz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/buy",
    "/sell",
    "/finance",
    "/service",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/buy" ? "daily" : "monthly",
    priority: path === "" ? 1.0 : path === "/buy" ? 0.9 : 0.6,
  }));

  let vehicleRoutes: MetadataRoute.Sitemap = [];
  try {
    const vehicles = await getAvailableVehicles();
    vehicleRoutes = vehicles.map((car) => ({
      url: `${siteUrl}/buy/${car.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    console.error("[sitemap] Failed to fetch vehicles:", err);
  }

  return [...staticRoutes, ...vehicleRoutes];
}
