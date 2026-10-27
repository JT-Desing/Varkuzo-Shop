import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: process.env.VARKUZO_PREVIEW_HOST ? [process.env.VARKUZO_PREVIEW_HOST] : [],
};

export default nextConfig;
