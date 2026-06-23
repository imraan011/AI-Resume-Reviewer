import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse dynamic require aur worker files resolve karne ke liye automatic bundler optimization se exclude kiya hai
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
