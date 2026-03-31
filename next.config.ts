import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/premium", destination: "/paywall", permanent: false },
      { source: "/subscribe", destination: "/paywall", permanent: false },
    ];
  },
};

export default nextConfig;
