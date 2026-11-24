/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sharp", "@resvg/resvg-wasm"],
    // The PNG route reads this file with fs; nothing imports it, so tracing would skip it.
    outputFileTracingIncludes: {
      "/api/export/png": ["./node_modules/@resvg/resvg-wasm/index_bg.wasm"],
    },
  },
  // Instruments folded into others keep their old links working.
  async redirects() {
    return [
      { source: "/align", destination: "/image-treatment?source=tritone", permanent: true },
      { source: "/social-card", destination: "/event-series?template=note-typographic", permanent: true },
      { source: "/option-field", destination: "/three-regimes?view=field", permanent: true },
      { source: "/territory", destination: "/three-regimes?view=territory", permanent: true },
    ];
  },
};

export default nextConfig;
