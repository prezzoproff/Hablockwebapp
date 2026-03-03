import type { NextConfig } from "next";

const devDomain = process.env.REPLIT_DEV_DOMAIN;

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: devDomain
    ? [`https://${devDomain}`, `http://${devDomain}`]
    : ["*.replit.dev"],
};

export default nextConfig;
