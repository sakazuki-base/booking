// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // ← 型エラーも一時的に無視したいなら短期間だけ
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
