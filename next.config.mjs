/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent webpack from bundling native .node binaries
  serverExternalPackages: ["sharp", "@resvg/resvg-js"],
};

export default nextConfig;
