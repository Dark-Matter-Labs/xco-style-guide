import { LOOP_SECONDS, VIDEO_FPS } from "@/lib/event-series/formats";
import { drawCard } from "./templates";
import type { Assets, CardSpec } from "./types";

// Exports render at full size on a fresh canvas, independent of the preview.
// PNG is one frame. Video records one loop in real time through MediaRecorder,
// preferring MP4 (what Instagram and LinkedIn take) and falling back to WebM
// where the browser cannot encode MP4 — Firefox, today.

export function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

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
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG encoding failed."))), "image/png"),
  );
}

const VIDEO_TYPES = [
  { mime: "video/mp4;codecs=avc1.640028", ext: "mp4" },
  { mime: "video/mp4;codecs=avc1.42E028", ext: "mp4" },
  { mime: "video/mp4", ext: "mp4" },
  { mime: "video/webm;codecs=vp9", ext: "webm" },
  { mime: "video/webm", ext: "webm" },
];

export function videoSupport(): { mime: string; ext: string } | null {
  if (typeof MediaRecorder === "undefined") return null;
  return VIDEO_TYPES.find((t) => MediaRecorder.isTypeSupported(t.mime)) ?? null;
}

export async function renderVideo(
  spec: CardSpec,
  assets: Assets,
  onProgress: (fraction: number) => void,
): Promise<{ blob: Blob; ext: string }> {
  const type = videoSupport();
  if (!type) throw new Error("This browser cannot record video. Try Chrome or Safari.");

  const { canvas, ctx } = canvasFor(spec);
  drawCard(ctx, spec, 0, assets);
  // Frames are pushed by hand (captureStream(0) + requestFrame) on a fixed
  // schedule, so the file has exactly one frame per 1/fps and one full loop —
  // pacing by requestAnimationFrame drops frames whenever the tab is busy,
  // and the loop comes out short.
  const stream = canvas.captureStream(0);
  const track = stream.getVideoTracks()[0] as MediaStreamTrack & { requestFrame?: () => void };
  const manual = typeof track.requestFrame === "function";
  const live = manual ? stream : canvas.captureStream(VIDEO_FPS);
  const recorder = new MediaRecorder(live, { mimeType: type.mime, videoBitsPerSecond: 12_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const stopped = new Promise<void>((resolve, reject) => {
    recorder.onstop = () => resolve();
    recorder.onerror = () => reject(new Error("Recording failed."));
  });

  const frames = LOOP_SECONDS * VIDEO_FPS;
  const frameMs = 1000 / VIDEO_FPS;
  const sleepUntil = (t: number) => new Promise((r) => setTimeout(r, Math.max(0, t - performance.now())));

  recorder.start(250);
  const start = performance.now();
  for (let i = 0; i < frames; i++) {
    drawCard(ctx, spec, i / frames, assets);
    if (manual) track.requestFrame?.();
    onProgress(i / frames);
    await sleepUntil(start + (i + 1) * frameMs);
  }
  recorder.stop();
  await stopped;
  live.getTracks().forEach((t) => t.stop());
  stream.getTracks().forEach((t) => t.stop());
  onProgress(1);
  return { blob: new Blob(chunks, { type: type.mime.split(";")[0] }), ext: type.ext };
}
