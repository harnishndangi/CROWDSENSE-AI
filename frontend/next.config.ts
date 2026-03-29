import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
};

// Disable turbopack warnings by pointing to the correct root.
// @ts-ignore: turbopack type might be missing from NextConfig type in this version
nextConfig.turbopack = {
  root: typeof __dirname !== 'undefined' ? path.join(__dirname) : process.cwd(),
};

export default nextConfig;
