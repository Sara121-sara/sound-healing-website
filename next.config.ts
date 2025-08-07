import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['hhwhwtozhbaztpoyslpx.supabase.co'],
    unoptimized: true
  },
  // Netlify 部署优化
  trailingSlash: true
};

export default nextConfig;
