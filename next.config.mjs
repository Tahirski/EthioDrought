import { resolve } from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  outputFileTracingRoot: resolve(process.cwd()),
};

export default nextConfig;
