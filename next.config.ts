import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Avoid picking a parent folder lockfile as the tracing root (e.g. ~/package-lock.json)
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
