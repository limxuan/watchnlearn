import type { NextConfig } from "next";
const baseSupabaseDomain = process.env.NEXT_PUBLIC_SUPABASE_URL!.split("/")[2];

const nextConfig: NextConfig = {
  images: {
    domains: [baseSupabaseDomain],
  },
  /* config options here */
};

export default nextConfig;
