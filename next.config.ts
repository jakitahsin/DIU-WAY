import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Official DIU campus photography
      { protocol: "https", hostname: "daffodilvarsity.edu.bd", pathname: "/images/**" },
      { protocol: "https", hostname: "www.daffodilvarsity.edu.bd", pathname: "/images/**" },
    ],
  },
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
