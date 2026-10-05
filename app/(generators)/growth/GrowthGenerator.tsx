"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { defaultGrowth, type GrowthParams } from "@/lib/growth/differential-line";
import { seedShapes, type SeedShape, type SeedSpec } from "@/lib/growth/seeds";
import { aperturePositions } from "@/lib/group-marks";
import { download, recordCanvas, videoSupport } from "@/lib/media/record-video";
import { Button, labelClass, RadioList, Section } from "@/components/generator-controls";
import { boundsOf, drawGrowth, growthPalettes, growthSvg, ringsFrom, type GrowthFrame, type GrowthLook, type GrowthPaletteId, type GrowthStyle } from "./render";
import { useGrowth } from "./useGrowth";

const FORMATS = [
  { id: "square", label: "Square — 1080 × 1080", w: 1080, h: 1080 },
  { id: "landscape", label: "Slide — 1600 × 900", w: 1600, h: 900 },
  { id: "portrait", label: "Portrait — 1080 × 1350", w: 1080, h: 1350 },
  { id: "story", label: "Story — 1080 × 1920", w: 1080, h: 1920 },
  { id: "banner", label: "Banner — 1500 × 500", w: 1500, h: 500 },
] as const;
type FormatId = (typeof FORMATS)[number]["id"];

// Fold spacing is the repulsion radius; it sets the character of the growth.
const DENSITIES = [
  { id: "fine", label: "Fine", hint: "Tight folds, coral-like", far: 0.012 },
  { id: "medium", label: "Medium", hint: "The original's balance", far: 0.02 },
  { id: "open", label: "Open", hint: "Wide, slow meanders", far: 0.032 },
] as const;
type DensityId = (typeof DENSITIES)[number]["id"];

const STYLES: { id: GrowthStyle; label: string; hint: string }[] = [
  { id: "line", label: "Line", hint: "The grown line alone" },
  { id: "rings", label: "Growth rings", hint: "Earlier outlines beneath — the growth's own history" },
  { id: "fill", label: "Fill", hint: "A solid form (closed seeds only)" },
];

const VIDEO_FPS = 30;
const VIDEO_FRAMES = 8 * VIDEO_FPS;   // the growth, replayed over eight seconds
const VIDEO_HOLD = VIDEO_FPS;         // then one second on the finished form

function monoFamily(): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-dm-mono").trim();
  return v ? `${v}, monospace` : "monospace";
}

export function GrowthGenerator() {
  const [shape, setShape] = useState<SeedShape>("aperture");
  const [rotation, setRotation] = useState(0);
  const [seed, setSeed] = useState(1);
  const [density, setDensity] = useState<DensityId>("medium");
  const [maxNodes, setMaxNodes] = useState(4000);
  const [spawn, setSpawn] = useState<GrowthParams["spawn"]>("curvature");
  const [style, setStyle] = useState<GrowthStyle>("line");
  const [palette, setPalette] = useState<GrowthPaletteId>("paper");
  const [zoom, setZoom] = useState(1);
  const [formatId, setFormatId] = useState<FormatId>("square");
  const [caption, setCaption] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reduce, setReduce] = useState(false);
  const [video, setVideo] = useState<ReturnType<typeof videoSupport>>(null);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setVideo(videoSupport());
  }, []);

  const seedSpec: SeedSpec = useMemo(() => ({ shape, rotation, seed }), [shape, rotation, seed]);
  const params: GrowthParams = useMemo(
    () => ({ ...defaultGrowth, far: DENSITIES.find((d) => d.id === density)!.far, maxNodes, spawn }),
    [density, maxNodes, spawn],
  );
  const look: GrowthLook = useMemo(() => ({ style, palette, zoom, caption }), [style, palette, zoom, caption]);
  const format = FORMATS.find((f) => f.id === formatId)!;
  const { run, version } = useGrowth(seedSpec, params);

  // The frame the growth is shown in: framed by the form as it stands.
  const frame: GrowthFrame | null = useMemo(
    () => (run ? { line: run.line, closed: run.closed, rings: ringsFrom(run.history), bounds: boundsOf(run.line) } : null),
    // Recomputed per growth update; run is a ref the hook replaces each time.
    [version],
  );

  const shapeLabel = seedShapes.find((s) => s.id === shape)!.label;
  const description = `${shapeLabel}${shape === "aperture" ? ` at ${rotation}°` : ""}, grown by differential growth from seed ${seed}${run ? `, ${run.nodes.toLocaleString()} nodes` : ""}.`;

  // Preview: drawn at the true output size, scaled by CSS.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !run || !frame) return;
    // Growing in front of the reader is motion; under reduced motion, show the
    // seed and then the finished form only.
    if (reduce && !run.done && run.steps > 0) return;
    drawGrowth(ctx, format.w, format.h, frame, look, seed, monoFamily());
  }, [frame, run, look, format, seed, reduce]);

  const name = `xco-growth-${shape}${shape === "aperture" ? rotation : ""}-${seed}-${style}-${palette}-${format.id}`;

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

  const exportSvg = () =>
    job("svg", async () => {
      if (!frame) return;
      const svg = growthSvg(format.w, format.h, frame, look, seed, description);
      download(new Blob([svg], { type: "image/svg+xml" }), `${name}.svg`);
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
      if (!run) return;
      const canvas = document.createElement("canvas");
      canvas.width = format.w;
      canvas.height = format.h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available.");
      const h = run.history;
      const mono = monoFamily();
      const bounds = boundsOf(h[h.length - 1]); // the finished form fixes the frame
      const { blob, ext } = await recordCanvas(canvas, {
        frames: VIDEO_FRAMES + VIDEO_HOLD,
        fps: VIDEO_FPS,
        draw: (i) => {
          const k = Math.min(h.length - 1, Math.floor((Math.min(i, VIDEO_FRAMES - 1) / (VIDEO_FRAMES - 1)) * (h.length - 1)));
          drawGrowth(ctx, format.w, format.h, { line: h[k], closed: run.closed, rings: ringsFrom(h.slice(0, k + 1)), bounds }, look, seed, mono);
        },
        onProgress: (p) => setBusy(`video:${Math.round(p * 100)}`),
      });
      download(blob, `${name}.${ext}`);
    });

  const status = !run
    ? "Preparing…"
    : run.done
      ? `Grown — ${run.nodes.toLocaleString()} nodes over ${run.steps.toLocaleString()} steps (${run.stopped === "boundary" ? "reached the edge" : run.stopped === "max-nodes" ? "reached its size" : "step limit"}).`
      : `Growing… ${run.nodes.toLocaleString()} nodes · ${run.steps.toLocaleString()} steps`;
  const ready = !!run?.done && busy === null;
  const recording = busy?.startsWith("video");

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <aside className="w-full lg:w-80 shrink-0 space-y-6" aria-label="Growth settings">
        <Section title="Start from">
          <RadioList name="shape" value={shape} options={seedShapes} onChange={setShape} />
          {shape === "aperture" && (
            <label className="block space-y-1 pt-2">
              <span className={`${labelClass} uppercase tracking-wider`}>Opening</span>
              <select
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className={`w-full min-h-11 bg-transparent border border-xco-ink px-2 ${labelClass}`}
              >
                {aperturePositions.map((a) => (
                  <option key={a} value={a}>{a}° — {a === 0 ? "as the logo" : "rotated, as a group mark"}</option>
                ))}
              </select>
            </label>
          )}
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
              <Button onClick={() => setSeed((s) => ((s * 1103515245 + 12345) >>> 0) % 100000 || 1)}>↻ New seed</Button>
            </div>
          </div>
          <p className={`${labelClass} text-xco-ink-muted`}>The same seed and settings always grow the same form.</p>
        </Section>

        <Section title="Growth">
          <RadioList name="density" value={density} options={DENSITIES.map((d) => ({ id: d.id, label: d.label, hint: d.hint }))} onChange={setDensity} />
          <label className="block space-y-1 pt-2">
            <span className={`${labelClass} uppercase tracking-wider`}>Size — {maxNodes.toLocaleString()} nodes</span>
            <input type="range" min={1000} max={9000} step={500} value={maxNodes} onChange={(e) => setMaxNodes(Number(e.target.value))} className="w-full accent-xco-dusk" />
          </label>
          <RadioList
            name="spawn"
            value={spawn}
            options={[
              { id: "curvature", label: "Where it bends", hint: "New nodes favour sharp turns — crisper lobes" },
              { id: "random", label: "Anywhere", hint: "Even growth along the whole line" },
            ]}
            onChange={setSpawn}
          />
        </Section>

        <Section title="Look">
          <RadioList name="style" value={style} options={STYLES} onChange={setStyle} />
          <RadioList name="palette" value={palette} options={growthPalettes.map((p) => ({ id: p.id, label: p.label }))} onChange={setPalette} />
          <label className="block space-y-1 pt-2">
            <span className={`${labelClass} uppercase tracking-wider`}>Scale — {zoom.toFixed(1)}×</span>
            <input type="range" min={0.5} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-xco-dusk" />
          </label>
        </Section>

        <Section title="Format">
          <RadioList name="format" value={formatId} options={FORMATS.map((f) => ({ id: f.id, label: f.label }))} onChange={setFormatId} />
          <label className="flex items-start gap-2 cursor-pointer pt-2">
            <input type="checkbox" checked={caption} onChange={(e) => setCaption(e.target.checked)} className="accent-xco-dusk mt-1.5" />
            <span>
              <span className={`${labelClass} block`}>Status caption</span>
              <span className={`${labelClass} block text-xco-ink-muted`}>[ GENERATED / DIFFERENTIAL GROWTH · SEED ] — for anywhere it could be read as a record</span>
            </span>
          </label>
        </Section>

        <Section title="Export">
          <div className="space-y-2">
            <Button onClick={exportSvg} disabled={!ready}>{busy === "svg" ? "exporting…" : `↓ SVG — ${format.w} × ${format.h}`}</Button>
            <Button onClick={exportPng} disabled={!ready}>{busy === "png" ? "exporting…" : `↓ PNG — ${format.w} × ${format.h}`}</Button>
            <Button onClick={exportVideo} disabled={!ready || !video}>
              {recording ? `recording… ${busy?.split(":")[1] ?? 0}%` : video ? `↓ ${video.ext.toUpperCase()} — the growth, 9s` : "Video needs Chrome or Safari"}
            </Button>
            <p role="status" aria-live="polite" className={`${labelClass} ${message ? "text-xco-dusk-ink" : "text-xco-ink-muted"}`}>
              {message ?? status}
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
          Expressive, not data: the folds encode nothing. Algorithm after{" "}
          <a href="https://github.com/inconvergent/differential-line" className="underline underline-offset-2 text-xco-ink" target="_blank" rel="noreferrer">
            inconvergent/differential-line
          </a>{" "}
          (Anders Hoff, MIT).
        </p>
      </div>
    </div>
  );
}
