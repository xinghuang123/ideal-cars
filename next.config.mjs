/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qbesmdxntzrbzlwfbqmy.supabase.co",
        pathname: "/storage/v1/object/public/vehicle-images/**",
      },
    ],
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
