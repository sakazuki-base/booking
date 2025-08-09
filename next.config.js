/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {};

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // typescript: { ignoreBuildErrors: true }, // ←最終手段（短期間のみ推奨）
};
module.exports = nextConfig;

export default config;
