"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { chaosSystems, generateChaos, type ChaosParams, type ChaosSystem } from "@/lib/chaos/systems";
import { download, recordCanvas, videoSupport } from "@/lib/media/record-video";
import { Button, labelClass, RadioList, Section } from "@/components/generator-controls";
import { attractorRaster, chaosPalettes, chaosSvg, drawChaos, type ChaosFrame, type ChaosLook, type ChaosPaletteId } from "./render";

const FORMATS = [
  { id: "square", label: "Square — 1080 × 1080", w: 1080, h: 1080 },
  { id: "landscape", label: "Slide — 1600 × 900", w: 1600, h: 900 },
  { id: "portrait", label: "Portrait — 1080 × 1350", w: 1080, h: 1350 },
  { id: "story", label: "Story — 1080 × 1920", w: 1080, h: 1920 },
  { id: "banner", label: "Banner — 1500 × 500", w: 1500, h: 500 },
] as const;
type FormatId = (typeof FORMATS)[number]["id"];

const FRAMES: { id: ChaosFrame; label: string; hint: string }[] = [
  { id: "framed", label: "Framed", hint: "A quiet margin around the field — the default" },
  { id: "bleed", label: "Bleed", hint: "The field runs off the edges" },
];

const VIDEO_FPS = 30;
const VIDEO_FRAMES = 8 * VIDEO_FPS;
const VIDEO_HOLD = VIDEO_FPS;

function monoFamily(): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-dm-mono").trim();
  return v ? `${v}, monospace` : "monospace";
}

const nextSeed = (s: number) => ((s * 1103515245 + 12345) >>> 0) % 100000 || 1;

export function ChaosGenerator() {
  const [system, setSystem] = useState<ChaosSystem>("attractor");
  const [seed, setSeed] = useState(7);
  const [chaos, setChaos] = useState(0.35);
  const [density, setDensity] = useState(1);
  const [palette, setPalette] = useState<ChaosPaletteId>("chalk");
  const [frame, setFrame] = useState<ChaosFrame>("framed");
  const [zoom, setZoom] = useState(1);
  const [trace, setTrace] = useState(true);
  const [caption, setCaption] = useState(false);
  const [formatId, setFormatId] = useState<FormatId>("square");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [video, setVideo] = useState<ReturnType<typeof videoSupport>>(null);

  useEffect(() => setVideo(videoSupport()), []);

  // Sliders move faster than an attractor can be iterated; render the latest
  // settled value rather than every intermediate one.
  const params: ChaosParams = useDeferredValue(useMemo(() => ({ system, seed, chaos, density }), [system, seed, chaos, density]));
  const result = useMemo(() => generateChaos(params), [params]);
  const look: ChaosLook = useMemo(() => ({ palette, frame, zoom, trace, caption }), [palette, frame, zoom, trace, caption]);
  const format = FORMATS.find((f) => f.id === formatId)!;

  const systemLabel = chaosSystems.find((s) => s.id === params.system)!.label;
  const description = `${systemLabel} pattern, seed ${params.seed}, chaos ${Math.round(params.chaos * 100)}%: ${result.detail}. Generated and expressive; it encodes no data.`;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawChaos(ctx, format.w, format.h, result, look, params.seed, monoFamily());
  }, [result, look, format, params.seed]);

  const name = `xco-chaos-${params.system}-${params.seed}-c${Math.round(params.chaos * 100)}-${palette}-${format.id}`;

  async function job(id: string, fn: () => Promise<void>) {
    setBusy(id);
    setMessage(null);
    try {
      await fn();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setBusy(null);
    }
  }

  const svg = result.kind === "paths";
  const exportSvg = () =>
    job("svg", async () => {
      const text = chaosSvg(format.w, format.h, result, look, description);
      if (text) download(new Blob([text], { type: "image/svg+xml" }), `${name}.svg`);
    });

  const exportPng = () =>
    job("png", async () => {
      const c = canvasRef.current;
      if (!c) return;
      const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
      if (!blob) throw new Error("PNG encoding failed.");
      download(blob, `${name}.png`);
    });

  const exportVideo = () =>
    job("video", async () => {
      const canvas = document.createElement("canvas");
      canvas.width = format.w;
      canvas.height = format.h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available.");
      const mono = monoFamily();
      // The attractor accumulates: one raster, advanced frame by frame.
      const raster = result.kind === "points" ? attractorRaster(format.w, format.h, result.xy, look) : undefined;
      const { blob, ext } = await recordCanvas(canvas, {
        frames: VIDEO_FRAMES + VIDEO_HOLD,
        fps: VIDEO_FPS,
        draw: (i) => {
          const p = Math.min(1, (i + 1) / VIDEO_FRAMES);
          drawChaos(ctx, format.w, format.h, result, look, params.seed, mono, 1 - Math.pow(1 - p, 2), raster);
        },
        onProgress: (p) => setBusy(`video:${Math.round(p * 100)}`),
      });
      download(blob, `${name}.${ext}`);
    });

  const recording = busy?.startsWith("video");
  const stale = params.seed !== seed || params.chaos !== chaos || params.density !== density || params.system !== system;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <aside className="w-full lg:w-80 shrink-0 space-y-6" aria-label="Chaos settings">
        <Section title="System">
          <RadioList name="system" value={system} options={chaosSystems} onChange={setSystem} />
          <div className="flex items-end gap-3 pt-2">
            <label className="block space-y-1 flex-1">
              <span className={`${labelClass} uppercase tracking-wider`}>Seed</span>
              <input
                type="number"
                min={1}
                value={seed}
                onChange={(e) => setSeed(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                className={`w-full min-h-11 bg-transparent border-b border-xco-ink ${labelClass}`}
              />
            </label>
            <div className="w-36">
              <Button onClick={() => setSeed(nextSeed)}>↻ New seed</Button>
            </div>
          </div>
          <p className={`${labelClass} text-xco-ink-muted`}>The same seed and settings always make the same field.</p>
        </Section>

        <Section title="Order ↔ chaos">
          <label className="block space-y-1">
            <span className={`${labelClass} uppercase tracking-wider`}>Chaos — {Math.round(chaos * 100)}%</span>
            <input type="range" min={0} max={1} step={0.01} value={chaos} onChange={(e) => setChaos(Number(e.target.value))} className="w-full accent-xco-dusk" />
          </label>
          <p className={`${labelClass} text-xco-ink-muted`}>
            {system === "attractor" && "Adds random jitter to every step of the attractor."}
            {system === "flow" && "Raises the field's frequency and adds a random turn at each step."}
            {system === "drift" && "Lowers the tail exponent: more long flights, looser turns."}
          </p>
          <label className="block space-y-1 pt-2">
            <span className={`${labelClass} uppercase tracking-wider`}>Density — {density.toFixed(1)}×</span>
            <input type="range" min={0.5} max={2} step={0.1} value={density} onChange={(e) => setDensity(Number(e.target.value))} className="w-full accent-xco-dusk" />
          </label>
        </Section>

        <Section title="Look">
          <RadioList name="palette" value={palette} options={chaosPalettes.map((p) => ({ id: p.id, label: p.label }))} onChange={setPalette} />
          <RadioList name="frame" value={frame} options={FRAMES} onChange={setFrame} />
          <label className="block space-y-1 pt-2">
            <span className={`${labelClass} uppercase tracking-wider`}>Scale — {zoom.toFixed(1)}×</span>
            <input type="range" min={0.6} max={2.5} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-xco-dusk" />
          </label>
          <label className="flex items-start gap-2 cursor-pointer pt-2">
            <input type="checkbox" checked={trace} onChange={(e) => setTrace(e.target.checked)} className="accent-xco-dusk mt-1.5" />
            <span>
              <span className={`${labelClass} block`}>One trajectory, followed</span>
              <span className={`${labelClass} block text-xco-ink-muted`}>The 2% signal: a single path marked in ember</span>
            </span>
          </label>
        </Section>

        <Section title="Format">
          <RadioList name="format" value={formatId} options={FORMATS.map((f) => ({ id: f.id, label: f.label }))} onChange={setFormatId} />
          <label className="flex items-start gap-2 cursor-pointer pt-2">
            <input type="checkbox" checked={caption} onChange={(e) => setCaption(e.target.checked)} className="accent-xco-dusk mt-1.5" />
            <span>
              <span className={`${labelClass} block`}>Status caption</span>
              <span className={`${labelClass} block text-xco-ink-muted`}>[ IMAGE / GENERATED · STOCHASTIC · SEED ] — for anywhere it could be read as data</span>
            </span>
          </label>
        </Section>

        <Section title="Export">
          <div className="space-y-2">
            <Button onClick={exportSvg} disabled={!svg || busy !== null || stale}>
              {busy === "svg" ? "exporting…" : svg ? `↓ SVG — ${format.w} × ${format.h}` : "SVG — paths only; the attractor is a density image"}
            </Button>
            <Button onClick={exportPng} disabled={busy !== null || stale}>{busy === "png" ? "exporting…" : `↓ PNG — ${format.w} × ${format.h}`}</Button>
            <Button onClick={exportVideo} disabled={busy !== null || stale || !video}>
              {recording ? `recording… ${busy?.split(":")[1] ?? 0}%` : video ? `↓ ${video.ext.toUpperCase()} — the field forming, 9s` : "Video needs Chrome or Safari"}
            </Button>
            <p role="status" aria-live="polite" className={`${labelClass} ${message ? "text-xco-dusk-ink" : "text-xco-ink-muted"}`}>
              {message ?? (stale ? "Updating…" : result.detail)}
            </p>
          </div>
        </Section>
      </aside>

      <div className="flex-1 min-w-0 space-y-4 order-first lg:order-none lg:sticky lg:top-24">
        <div className="border border-xco-ink mx-auto" style={{ maxWidth: format.h > format.w ? 560 : undefined }}>
          <canvas
            ref={canvasRef}
            width={format.w}
            height={format.h}
            role="img"
            aria-label={description}
            className="block w-full h-auto"
            style={{ aspectRatio: `${format.w} / ${format.h}` }}
          />
        </div>
        <p className={`${labelClass} text-xco-ink-muted`}>
          Expressive, not data: the density, paths and the ember trace encode
          nothing measured. Declare it as generated wherever it could be read
          as evidence.
        </p>
      </div>
    </div>
  );
}
