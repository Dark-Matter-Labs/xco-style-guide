/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sharp", "@resvg/resvg-wasm"],
  },
};

export default nextConfig;
