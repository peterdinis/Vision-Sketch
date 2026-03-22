import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["lucide-react", "next-safe-action", "zod"]
};

export default nextConfig;
