/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qbesmdxntzrbzlwfbqmy.supabase.co",
        pathname: "/storage/v1/object/public/vehicle-images/**",
      },
      {
        protocol: "https",
        hostname: "qbesmdxntzrbzlwfbqmy.supabase.co",
        pathname: "/storage/v1/object/public/site-images/**",
      },
    ],
    // Keep each optimized image cached for 31 days instead of the 60s default.
    // Our source images are immutable (uploads get a new UUID filename), so a
    // long TTL is safe and drastically cuts re-optimization "cache writes" on
    // Vercel — the variant is written once, then reused for a month.
    minimumCacheTTL: 2678400,
    // Trim the generated size ladder to the widths this site actually renders
    // (no 4K). Fewer widths per image = fewer cache writes.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [48, 64, 96, 128, 256, 384],
  },
  // Keep Node.js-only packages out of the webpack client bundle.
  experimental: {
    serverComponentsExternalPackages: [
      "@xenova/transformers",
      "@react-pdf/renderer",
      "mammoth",
      "pg",
      "sharp",
    ],
  },
};

export default nextConfig;
