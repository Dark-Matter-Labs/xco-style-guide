// The email signature (CH-15): the xCO mark in its zone, a hairline, then the
// endorsement strip in its own. Email clients drop SVG and web fonts, so the
// two marks ship as 2× PNGs from public/email (npm run email) and the words
// fall back to Arial. Both images are cropped to their ink, so they align with
// the name; table padding gives the clear space instead. Sizes keep each mark
// at or above its minimum: the xCO cap at 30px (24px minimum), DM's stamp at
// 16px (its on-screen minimum), with one stamp of space above the strip.

import { inkBounds, logoGeometry, stripMetrics } from "./logo";

/** Where the PNGs live once deployed. Signatures need absolute image URLs. */
export const SIGNATURE_ORIGIN = "https://xco-style-guide.vercel.app";

const CAP_PX = 30;
const STAMP_PX = 16;

const markBox = { x: inkBounds.left, y: inkBounds.top, w: inkBounds.right - inkBounds.left, h: inkBounds.bottom - inkBounds.top };
const s = stripMetrics.stamp;
const stripBox = { x: s, y: s, w: stripMetrics.width - 2 * s, h: s };

export const signatureImages = {
  mark: { path: "/email/xco-mark.png", box: markBox, ...px(markBox, CAP_PX / logoGeometry.cap), alt: "xCO" },
  strip: { path: "/email/dml-strip.png", box: stripBox, ...px(stripBox, STAMP_PX / s), alt: "An initiative of Dark Matter Labs" },
} as const;

function px(b: { w: number; h: number }, k: number) {
  return { w: Math.round(b.w * k), h: Math.round(b.h * k) };
}

/** Swaps a standalone SVG's viewBox for a crop, dropping its fixed size. */
export function cropSvg(svg: string, b: { x: number; y: number; w: number; h: number }): string {
  return svg
    .replace(/viewBox="[^"]*"/, `viewBox="${b.x} ${b.y} ${b.w} ${b.h}"`)
    .replace(/(<svg\b[^>]*?)\s(?:width|height)="[^"]*"/g, "$1")
    .replace(/(<svg\b[^>]*?)\s(?:width|height)="[^"]*"/g, "$1");
}

/** Table HTML for pasting into a mail client. [Name] and [Role] are for the sender to replace. */
export function signatureHtml(origin = SIGNATURE_ORIGIN): string {
  const img = (i: (typeof signatureImages)[keyof typeof signatureImages]) =>
    `<img src="${origin}${i.path}" width="${i.w}" height="${i.h}" alt="${i.alt}" style="display:block;border:0">`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;color:#101F24;border-collapse:collapse">
  <tr><td style="font-size:14px;line-height:20px">[Name]<br><span style="color:#374E4A">[Role], xCO</span></td></tr>
  <tr><td style="padding:14px 0 ${STAMP_PX}px">${img(signatureImages.mark)}</td></tr>
  <tr><td style="border-top:1px solid #DDD8CC;padding-top:${STAMP_PX}px">${img(signatureImages.strip)}</td></tr>
</table>`;
}
