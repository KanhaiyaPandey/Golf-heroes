import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@golf-heroes/ui", "@golf-heroes/shared", "@golf-heroes/database"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
