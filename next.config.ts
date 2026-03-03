import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: [
    `https://${process.env.REPLIT_DEV_DOMAIN}`,
    `http://${process.env.REPLIT_DEV_DOMAIN}`,
  ],
};

export default nextConfig;
