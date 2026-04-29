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
};

export default nextConfig;
