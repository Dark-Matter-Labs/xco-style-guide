/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sharp", "@resvg/resvg-wasm"],
    // The PNG route reads this file with fs; nothing imports it, so tracing would skip it.
    outputFileTracingIncludes: {
      "/api/export/png": ["./node_modules/@resvg/resvg-wasm/index_bg.wasm"],
    },
  },
};

export default nextConfig;
