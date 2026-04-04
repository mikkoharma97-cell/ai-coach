import type { NextConfig } from "next";

/**
 * Dev: allow HMR/chunks from phone (LAN IP) and tunnels. Without this, Next 15+ blocks
 * /_next/* with 403 when Origin is e.g. 192.168.x.x (hostname bind is 0.0.0.0).
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
 */
const lanFromEnv = (process.env.LAN_DEV_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Phone / LAN dev: host machine IP (add yours via LAN_DEV_ORIGINS if it changes). */
const defaultLanDevHosts = ["192.168.0.203"] as const;

const tunnelDevHosts = [
  "*.ngrok-free.app",
  "*.ngrok-free.dev",
  "*.ngrok.io",
  "*.ngrok.app",
  "*.trycloudflare.com",
  "*.loca.lt",
] as const;

const nextConfig: NextConfig = {
  allowedDevOrigins: [...defaultLanDevHosts, ...lanFromEnv, ...tunnelDevHosts],
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
