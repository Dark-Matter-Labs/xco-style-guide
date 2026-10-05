// Records a canvas animation to a video file in the browser.
//
// Frames are pushed by hand (captureStream(0) + requestFrame) on a fixed
// schedule, so the file has exactly one frame per 1/fps — pacing by
// requestAnimationFrame drops frames whenever the tab is busy. MP4 where the
// browser can encode it (what Instagram and LinkedIn take), WebM otherwise.

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

interface RecordOptions {
  frames: number;
  fps: number;
  /** Draws frame i (0-based) onto the canvas. */
  draw: (i: number) => void;
  onProgress?: (fraction: number) => void;
  bitsPerSecond?: number;
}

export async function recordCanvas(canvas: HTMLCanvasElement, o: RecordOptions): Promise<{ blob: Blob; ext: string }> {
  const type = videoSupport();
  if (!type) throw new Error("This browser cannot record video. Try Chrome or Safari.");

  o.draw(0);
  const stream = canvas.captureStream(0);
  const track = stream.getVideoTracks()[0] as MediaStreamTrack & { requestFrame?: () => void };
  const manual = typeof track.requestFrame === "function";
  const live = manual ? stream : canvas.captureStream(o.fps);
  const recorder = new MediaRecorder(live, { mimeType: type.mime, videoBitsPerSecond: o.bitsPerSecond ?? 12_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };
  const stopped = new Promise<void>((resolve, reject) => {
    recorder.onstop = () => resolve();
    recorder.onerror = () => reject(new Error("Recording failed."));
  });

  const frameMs = 1000 / o.fps;
  const sleepUntil = (t: number) => new Promise((r) => setTimeout(r, Math.max(0, t - performance.now())));

  recorder.start(250);
  const start = performance.now();
  for (let i = 0; i < o.frames; i++) {
    o.draw(i);
    if (manual) track.requestFrame?.();
    o.onProgress?.(i / o.frames);
    await sleepUntil(start + (i + 1) * frameMs);
  }
  recorder.stop();
  await stopped;
  live.getTracks().forEach((t) => t.stop());
  stream.getTracks().forEach((t) => t.stop());
  o.onProgress?.(1);
  return { blob: new Blob(chunks, { type: type.mime.split(";")[0] }), ext: type.ext };
}

export function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
