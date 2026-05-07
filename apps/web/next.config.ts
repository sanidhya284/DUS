import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests to the API in development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
