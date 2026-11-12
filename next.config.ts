import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Self-contained server in .next/standalone, copied into the Docker image.
  output: "standalone",
};

export default nextConfig;
