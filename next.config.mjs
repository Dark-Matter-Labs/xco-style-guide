/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sharp", "@resvg/resvg-wasm"],
    // The PNG route reads these files with fs; nothing imports them, so tracing would skip them.
    outputFileTracingIncludes: {
      "/api/export/png": ["./node_modules/@resvg/resvg-wasm/index_bg.wasm", "./public/fonts/Untitled*.woff2", "./app/api/export/png/fallback/*.ttf"],
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
