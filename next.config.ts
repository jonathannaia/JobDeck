import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/contractors/batch', destination: '/leads', permanent: false },
    ]
  },
};

export default nextConfig;
