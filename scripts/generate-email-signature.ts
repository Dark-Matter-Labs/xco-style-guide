// Renders the email signature's two PNGs from lib/logo.ts at 2×, with the same
// resvg and Untitled faces as the PNG export. Run: npm run email
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import { pngFonts } from "@/app/api/export/png/fonts";
import { buildEndorsementStripSvg, buildLogoSvg } from "@/lib/logo";
import { cropSvg, signatureImages } from "@/lib/email-signature";

(async () => {
  await initWasm(readFileSync("node_modules/@resvg/resvg-wasm/index_bg.wasm"));
  const { untitled, fallbacks } = await pngFonts(async (f) => new Uint8Array(readFileSync(f)));
  const render = (svg: string, width: number) =>
    new Resvg(svg, {
      font: { fontBuffers: [...untitled, ...fallbacks], defaultFontFamily: "Untitled Sans", loadSystemFonts: false },
      fitTo: { mode: "width", value: width },
    }).render().asPng();
  mkdirSync("public/email", { recursive: true });
  const { mark, strip } = signatureImages;
  writeFileSync(`public${mark.path}`, render(cropSvg(buildLogoSvg({ variant: "ink" }), mark.box), mark.w * 2));
  writeFileSync(`public${strip.path}`, render(cropSvg(buildEndorsementStripSvg({ variant: "ink" }), strip.box), strip.w * 2));
  console.log(`email: wrote ${mark.path} (${mark.w * 2}px) and ${strip.path} (${strip.w * 2}px)`);
})();
