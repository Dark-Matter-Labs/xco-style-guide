import { NextRequest, NextResponse } from "next/server";
import { Resvg } from "@resvg/resvg-js";
import fs from "fs";
import path from "path";

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Crimson+Pro:ital@0;1&family=Inter:wght@400;500&family=DM+Mono:ital,wght@0,400;1,400&display=swap";

const FONTS_DIR = "/tmp/xco-fonts";

// Resolved once per container instance
let fontsReady: Promise<string> | null = null;

function prepareFonts(): Promise<string> {
  if (fontsReady) return fontsReady;
  fontsReady = (async () => {
    fs.mkdirSync(FONTS_DIR, { recursive: true });

    // Old Android 2.2 UA → Google Fonts returns TTF (magic 00010000).
    // Modern UAs get woff2/woff which resvg's font loader cannot parse.
    const cssRes = await fetch(GOOGLE_FONTS_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
      },
    });
    if (!cssRes.ok) throw new Error(`Google Fonts fetch failed: ${cssRes.status}`);
    const css = await cssRes.text();

    const urls = Array.from(
      css.matchAll(/url\((https?:\/\/fonts\.gstatic\.com\/[^)]+)\)/g),
    ).map((m) => m[1]);

    await Promise.all(
      urls.map(async (url, i) => {
        const dest = path.join(FONTS_DIR, `font-${i}.ttf`);
        if (fs.existsSync(dest)) return;
        const res = await fetch(url);
        if (!res.ok) return;
        fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      }),
    );

    return FONTS_DIR;
  })();
  return fontsReady;
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

    const fontDir = await prepareFonts();

    // Strip @import — resvg can't fetch external CSS; fonts come from fontDirs
    const svgClean = svg.replace(/@import url\([^)]+\);?/g, "");

    // Add explicit pixel dimensions for correct rasterisation size
    const svgWithSize = svgClean.replace("<svg", `<svg width="${width}" height="${height}"`);

    const resvg = new Resvg(svgWithSize, {
      font: {
        fontDirs: [fontDir],
        loadSystemFonts: false,
        defaultFontFamily: "DM Mono",
      },
      fitTo: { mode: "width", value: width },
    });

    const rendered = resvg.render();
    const buffer = rendered.asPng();

    return new NextResponse(new Uint8Array(buffer), {
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
