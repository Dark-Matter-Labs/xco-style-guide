// Output sizes for the event cards, one per place they are posted.

export type CardFormatId = "square" | "portrait" | "story" | "landscape";

export interface CardFormat {
  id: CardFormatId;
  label: string;
  w: number;
  h: number;
  use: string;
}

export const cardFormats: CardFormat[] = [
  { id: "square",    label: "Square",    w: 1080, h: 1080, use: "Luma cover · Instagram · LinkedIn" },
  { id: "portrait",  label: "Portrait",  w: 1080, h: 1350, use: "Instagram feed (4:5)" },
  { id: "story",     label: "Story",     w: 1080, h: 1920, use: "Instagram / LinkedIn story (9:16)" },
  { id: "landscape", label: "Landscape", w: 1200, h: 630,  use: "Link preview · LinkedIn · Signal" },
];

export const formatById = (id: CardFormatId): CardFormat =>
  cardFormats.find((f) => f.id === id) ?? cardFormats[0];

/** One loop of every animation, in seconds. All motion is periodic in it, so
 *  exported video loops without a seam. */
export const LOOP_SECONDS = 8;
export const VIDEO_FPS = 30;
