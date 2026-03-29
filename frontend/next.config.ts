import type { NextConfig } from "next";
import path from "path";
import fs from "fs";
import { config as loadEnv } from "dotenv";

// Single source of truth: repo `backend/.env` (same as FastAPI). Does not override vars already set (e.g. frontend/.env.local).
const backendEnv = path.join(process.cwd(), "..", "backend", ".env");
if (fs.existsSync(backendEnv)) {
  loadEnv({ path: backendEnv, override: false });
}

// Bridge backend names → Next public client (only if not already set locally).
if (process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.SUPABASE_URL;
}
if (process.env.SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
}

const nextConfig: NextConfig = {
  /* config options here */
};

// @ts-ignore turbopack root
nextConfig.turbopack = {
  root: typeof __dirname !== "undefined" ? path.join(__dirname) : process.cwd(),
};

export default nextConfig;
