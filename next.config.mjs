/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["sharp", "@resvg/resvg-js"],
  webpack(config, { isServer }) {
    if (isServer) {
      // Belt-and-suspenders: also add webpack-level externals so webpack never
      // tries to bundle the native .node binaries packaged with @resvg/resvg-js.
      const existing = Array.isArray(config.externals) ? config.externals : [];
      config.externals = [
        ...existing,
        ({ request }, callback) => {
          if (request && (request.startsWith("@resvg/") || request === "sharp")) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
    }
    return config;
  },
};

export default nextConfig;
