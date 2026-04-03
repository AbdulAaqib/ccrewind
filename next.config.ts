import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: [
    "microwave-lawrence-stuart-result.trycloudflare.com",
    "files-airplane-prayers-burst.trycloudflare.com",
    "modifications-lanka-span-cinema.trycloudflare.com",
  ],
};

export default nextConfig;
