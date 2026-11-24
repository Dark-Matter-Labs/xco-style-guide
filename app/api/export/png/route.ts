import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import { woff2ToSfnt } from "./woff2";

let wasmReady: Promise<void> | null = null;
let cachedFonts: Uint8Array[] | null = null;

// Read the wasm from the function bundle, never over HTTP: preview deployments
// answer a self-fetch with Vercel's sign-in page. next.config traces the file in.
const WASM_PATH = path.join(process.cwd(), "node_modules/@resvg/resvg-wasm/index_bg.wasm");

function ensureWasm(): Promise<void> {
  if (wasmReady) return wasmReady;
  wasmReady = readFile(WASM_PATH)
    .then((bytes) => initWasm(bytes))
    .catch((err) => {
      wasmReady = null; // let the next request retry instead of caching the failure
      throw err;
    });
  return wasmReady;
}

// The licensed Untitled faces, read from the site's own web fonts and decoded
// to TrueType once: resvg reads TTF, not WOFF2. next.config traces the files in.
const FONT_FILES = ["UntitledSansRegular", "UntitledSansItalic", "UntitledSerifRegular", "UntitledSerifItalic"];

async function loadFonts(): Promise<Uint8Array[]> {
  if (cachedFonts) return cachedFonts;
  const files = await Promise.all(FONT_FILES.map((f) => readFile(path.join(process.cwd(), "public/fonts", `${f}.woff2`))));
  cachedFonts = files.map((b) => woff2ToSfnt(new Uint8Array(b)));
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

    await ensureWasm();
    const fonts = await loadFonts();

    // Strip @import — resvg-wasm can't fetch external CSS; fonts come from fontBuffers
    const svgClean = svg.replace(/@import url\([^)]+\);?/g, "");

    // Add explicit pixel dimensions for correct rasterisation size.
    // Any width/height already on the root <svg> must be dropped first —
    // resvg rejects duplicate attributes outright ("attribute 'width' is
    // already defined"), which standalone SVG files legitimately carry.
    // Scoped to the root tag so nested width/height (rect, image) survive.
    const svgWithSize = svgClean.replace(/<svg\b[^>]*>/, (rootTag) => {
      const stripped = rootTag.replace(/\s(?:width|height)\s*=\s*(?:"[^"]*"|'[^']*')/g, "");
      return stripped.replace("<svg", `<svg width="${width}" height="${height}"`);
    });

    const resvg = new Resvg(svgWithSize, {
      font: {
        fontBuffers: fonts,
        defaultFontFamily: "Untitled Sans",
        // Only the faces above: a missing glyph shows as missing, not in a stand-in face.
        loadSystemFonts: false,
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
