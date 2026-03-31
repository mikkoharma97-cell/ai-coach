import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GIT_COMMIT_SHA:
      process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT ?? "",
  },
  async redirects() {
    return [
      { source: "/premium", destination: "/paywall", permanent: false },
      { source: "/subscribe", destination: "/paywall", permanent: false },
    ];
  },
};

export default nextConfig;
