import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import { pngFonts } from "./fonts";

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

async function loadFonts(): Promise<Uint8Array[]> {
  if (cachedFonts) return cachedFonts;
  const { untitled, fallbacks } = await pngFonts((f) => readFile(path.join(process.cwd(), f)).then((b) => new Uint8Array(b)));
  // Untitled first: resvg looks for a missing character's face in this order.
  cachedFonts = [...untitled, ...fallbacks];
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

    // Strip @import — resvg-wasm can't fetch external CSS; fonts come from fontBuffers.
    // NFC: an accent typed as a separate character joins its letter, which a face can draw whole.
    const svgClean = svg.replace(/@import url\([^)]+\);?/g, "").normalize("NFC");

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
        // Only the faces above, never whatever the server happens to have installed.
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
