import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Curated photography (study/writing themes) served from Unsplash's CDN.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
