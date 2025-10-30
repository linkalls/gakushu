import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'better-sqlite3'];
    }
    return config;
  },
};

export default config;
