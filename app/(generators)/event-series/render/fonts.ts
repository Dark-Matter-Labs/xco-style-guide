import type { Fonts } from "./types";

// Canvas draws with whatever font is loaded at the moment of drawing, and
// silently falls back if it is not. So every face is resolved to its real
// family string and loaded explicitly before the first frame.

const SERIF = '"Untitled Serif", Georgia, serif';
const SANS = '"Untitled Sans", Arial, sans-serif';

/** DM Mono comes from next/font, whose family name is generated; read it off
 *  the CSS variable the root layout sets. */
function monoFamily(): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-dm-mono").trim();
  return v ? `${v}, "Courier New", monospace` : '"DM Mono", "Courier New", monospace';
}

export function resolveFonts(instrumentFamily: string): Fonts {
  return {
    serif: SERIF,
    sans: SANS,
    mono: monoFamily(),
    instrument: `${instrumentFamily}, Georgia, serif`,
  };
}

export async function loadFonts(fonts: Fonts): Promise<void> {
  const faces = [
    `400 64px ${fonts.serif}`,
    `400 64px ${fonts.sans}`,
    `400 64px ${fonts.mono}`,
    `500 64px ${fonts.mono}`,
    `400 64px ${fonts.instrument}`,
  ];
  // A face that fails to load is not fatal: the card still draws in the fallback.
  await Promise.allSettled(faces.map((f) => document.fonts.load(f)));
  await document.fonts.ready;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}
