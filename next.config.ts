import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-a8c13977a0f5490c8e1f67d9c91e7930.r2.dev',
      },
    ],
  },
};

export default nextConfig;
