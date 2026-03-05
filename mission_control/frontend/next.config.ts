import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the VPS IP and localhost for development access
  allowedDevOrigins: ["localhost", "127.0.0.1", "135.125.131.247"],

  // Re-map API calls from frontend to backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL.replace('localhost', 'host.docker.internal')}/api/:path*`
          : "http://host.docker.internal:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
