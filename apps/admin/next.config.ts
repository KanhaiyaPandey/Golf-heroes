import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@golf-heroes/ui", "@golf-heroes/shared", "@golf-heroes/database"],
};

export default nextConfig;
