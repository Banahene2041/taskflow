import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Per-user guest sessions should not be statically cached.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
