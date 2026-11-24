import { LOOP_SECONDS, VIDEO_FPS } from "@/lib/event-series/formats";
import { canvasPNG } from "@/lib/media/export";
import { recordCanvas } from "@/lib/media/record-video";
import { drawCard } from "./templates";
import type { Assets, CardSpec } from "./types";

// Exports render at full size on a fresh canvas, independent of the preview.
// PNG is one frame. Video records one loop through lib/media/record-video,
// MP4 where the browser can encode it and WebM otherwise (Firefox, today).

function canvasFor(spec: CardSpec): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = spec.format.w;
  canvas.height = spec.format.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available in this browser.");
  return { canvas, ctx };
}

export async function renderPNG(spec: CardSpec, phase: number, assets: Assets): Promise<Blob> {
  const { canvas, ctx } = canvasFor(spec);
  drawCard(ctx, spec, phase, assets);
  return canvasPNG(canvas);
}

export function renderVideo(
  spec: CardSpec,
  assets: Assets,
  onProgress: (fraction: number) => void,
): Promise<{ blob: Blob; ext: string }> {
  const { canvas, ctx } = canvasFor(spec);
  const frames = LOOP_SECONDS * VIDEO_FPS;
  return recordCanvas(canvas, { frames, fps: VIDEO_FPS, draw: (i) => drawCard(ctx, spec, i / frames, assets), onProgress });
}
