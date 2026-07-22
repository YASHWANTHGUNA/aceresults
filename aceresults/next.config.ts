import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This stops Turbopack from breaking the PDF library
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
