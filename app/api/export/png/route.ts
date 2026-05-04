import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Crimson+Pro:ital@0;1&family=Inter:wght@400;500&family=DM+Mono:ital,wght@0,400;1,400&display=swap";

// Module-level cache — persists for the lifetime of the serverless container.
let cachedFontCSS: string | null = null;

async function getEmbeddedFontCSS(): Promise<string> {
  if (cachedFontCSS) return cachedFontCSS;

  const cssRes = await fetch(GOOGLE_FONTS_URL, {
    headers: {
      // woff2 format requires a modern UA
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!cssRes.ok) throw new Error(`Google Fonts fetch failed: ${cssRes.status}`);
  const css = await cssRes.text();

  // Find all woff2 URLs and replace with data URIs
  const urlPattern = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g;
  const matches = Array.from(css.matchAll(urlPattern));

  let result = css;
  await Promise.all(
    matches.map(async ([, url]) => {
      const fontRes = await fetch(url);
      if (!fontRes.ok) return;
      const buf = await fontRes.arrayBuffer();
      const b64 = Buffer.from(buf).toString("base64");
      result = result.replace(url, `data:font/woff2;base64,${b64}`);
    }),
  );

  cachedFontCSS = result;
  return result;
}

function injectFonts(svg: string, fontCSS: string): string {
  // Replace the @import line inside <style> with the full @font-face CSS
  return svg.replace(/@import url\([^)]+\);/, fontCSS);
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

    const fontCSS = await getEmbeddedFontCSS();
    const svgWithFonts = injectFonts(svg, fontCSS);

    // Add explicit dimensions so librsvg rasterises at the right size
    const svgWithSize = svgWithFonts.replace(
      "<svg",
      `<svg width="${width}" height="${height}"`,
    );

    const buffer = await sharp(Buffer.from(svgWithSize)).png().toBuffer();

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
