import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'bun:sqlite'];
    }
    return config;
  },
  serverExternalPackages: ['bun:sqlite'],
};

export default config;
