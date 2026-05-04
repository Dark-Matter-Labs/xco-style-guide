import { NextRequest, NextResponse } from "next/server";
import { Resvg, initWasm } from "@resvg/resvg-wasm";

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Crimson+Pro:ital@0;1&family=Inter:wght@400;500&family=DM+Mono:ital,wght@0,400;1,400&display=swap";

let wasmReady: Promise<void> | null = null;
let cachedFonts: Uint8Array[] | null = null;

// Fetch WASM from /resvg.wasm (public/ dir) so the binary is a static asset,
// not a filesystem read — avoids ENOENT in Vercel lambda bundles.
function ensureWasm(origin: string): Promise<void> {
  if (wasmReady) return wasmReady;
  wasmReady = initWasm(fetch(`${origin}/resvg.wasm`));
  return wasmReady;
}

async function loadFonts(): Promise<Uint8Array[]> {
  if (cachedFonts) return cachedFonts;

  // Old Android 2.2 UA → Google Fonts returns TTF (magic 00010000).
  const cssRes = await fetch(GOOGLE_FONTS_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
    },
  });
  if (!cssRes.ok) throw new Error(`Google Fonts CSS fetch failed: ${cssRes.status}`);
  const css = await cssRes.text();

  const urls = Array.from(
    css.matchAll(/url\((https?:\/\/fonts\.gstatic\.com\/[^)]+)\)/g),
  ).map((m) => m[1]);

  const results = await Promise.all(
    urls.map(async (url) => {
      const res = await fetch(url);
      if (!res.ok) return null;
      return new Uint8Array(await res.arrayBuffer());
    }),
  );

  cachedFonts = results.filter(Boolean) as Uint8Array[];
  return cachedFonts;
}

export async function POST(req: NextRequest) {
  try {
    const { svg, width, height } = (await req.json()) as {
      svg: string;
      width: number;
      height: number;
    };

    if (!svg || !width || !height) {
      return NextResponse.json({ error: "svg, width, height required" }, { status: 400 });
    }

    const origin = new URL(req.url).origin;
    await ensureWasm(origin);
    const fonts = await loadFonts();

    // Strip @import — resvg-wasm can't fetch external CSS; fonts come from fontBuffers
    const svgClean = svg.replace(/@import url\([^)]+\);?/g, "");

    // Add explicit pixel dimensions for correct rasterisation size
    const svgWithSize = svgClean.replace("<svg", `<svg width="${width}" height="${height}"`);

    const resvg = new Resvg(svgWithSize, {
      font: {
        fontBuffers: fonts,
        defaultFontFamily: "DM Mono",
      },
      fitTo: { mode: "width", value: width },
    });

    const rendered = resvg.render();
    const buffer = rendered.asPng();

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="xco-export.png"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
