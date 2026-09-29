"use client";

import { useEffect, useMemo, useState } from "react";
import { cardFormats, formatById, LOOP_SECONDS, type CardFormatId } from "@/lib/event-series/formats";
import { programme, type EventContent } from "@/lib/event-series/programme";
import { CardPreview } from "./CardPreview";
import { Button, labelClass, RadioList, Section, TextField } from "./controls";
import { download, renderPNG, renderVideo, videoSupport } from "./render/export";
import { paletteList } from "./render/palettes";
import { templateList } from "./render/templates";
import { imageryList } from "./render/imagery";
import type { CardSpec, ImageryId, PaletteId, TemplateId, TitleFace } from "./render/types";
import { useCardAssets } from "./useCardAssets";

// Each template opens in the palette it was designed in; any can be switched.
const DEFAULT_PALETTE: Record<TemplateId, PaletteId> = { window: "dusk", corner: "paper", globe: "ink" };

const FACES: { id: TitleFace; label: string; hint: string }[] = [
  { id: "xco", label: "Untitled Serif", hint: "xCO's display face" },
  { id: "medulla", label: "Instrument Serif", hint: "The face on Medulla's posters" },
];

// A stable seed per preset, so each evening keeps its own field.
const seedFor = (id: string): number =>
  Array.from(id).reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "event";
}

export function EventSeriesGenerator({ instrumentFamily }: { instrumentFamily: string }) {
  const { assets, error: assetError } = useCardAssets(instrumentFamily);

  const [presetId, setPresetId] = useState(programme[2].id);
  const [content, setContent] = useState<EventContent>(programme[2].content);
  const [template, setTemplate] = useState<TemplateId>("window");
  const [palette, setPalette] = useState<PaletteId>(DEFAULT_PALETTE.window);
  const [imagery, setImagery] = useState<ImageryId>("globe");
  const [formatId, setFormatId] = useState<CardFormatId>("square");
  const [titleFace, setTitleFace] = useState<TitleFace>("xco");
  const [uppercase, setUppercase] = useState(false);
  const [seed, setSeed] = useState(seedFor(programme[2].id));
  const [playing, setPlaying] = useState(true);
  const [stillPhase, setStillPhase] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Motion is opt-in for people who have asked for less of it.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }, []);

  const format = formatById(formatId);
  const spec: CardSpec = useMemo(
    () => ({ template, palette, imagery, format, content, titleFace, uppercase, seed }),
    [template, palette, imagery, format, content, titleFace, uppercase, seed],
  );
  // Read after mount: the server cannot know what this browser can record.
  const [video, setVideo] = useState<ReturnType<typeof videoSupport>>(null);
  useEffect(() => setVideo(videoSupport()), []);

  const choosePreset = (id: string) => {
    const preset = programme.find((p) => p.id === id);
    if (!preset) return;
    setPresetId(id);
    setContent(preset.content);
    setSeed(seedFor(id));
  };
  const chooseTemplate = (id: TemplateId) => {
    setTemplate(id);
    setPalette(DEFAULT_PALETTE[id]);
  };
  const edit = (key: keyof EventContent) => (v: string) => setContent((c) => ({ ...c, [key]: v }));

  const name = (f = format) => `xco-medulla-${slug(content.title)}-${template}-${imagery}-${f.id}`;

  async function run(id: string, job: () => Promise<void>) {
    if (!assets) return;
    setBusy(id);
    setMessage(null);
    try {
      await job();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setBusy(null);
    }
  }

  const exportPNG = () =>
    run("png", async () => {
      if (!assets) return;
      download(await renderPNG(spec, stillPhase, assets), `${name()}.png`);
    });

  const exportAllPNG = () =>
    run("png-all", async () => {
      if (!assets) return;
      for (const f of cardFormats) {
        download(await renderPNG({ ...spec, format: f }, stillPhase, assets), `${name(f)}.png`);
      }
    });

  const exportVideo = () =>
    run("video", async () => {
      if (!assets) return;
      const { blob, ext } = await renderVideo(spec, assets, (p) => setBusy(`video:${Math.round(p * 100)}`));
      download(blob, `${name()}.${ext}`);
    });

  const recording = busy?.startsWith("video");

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <aside className="w-full lg:w-80 shrink-0 space-y-6" aria-label="Card settings">
        <Section title="Event">
          <label className="block space-y-1">
            <span className={`${labelClass} uppercase tracking-wider`}>From the programme</span>
            <select
              value={presetId}
              onChange={(e) => choosePreset(e.target.value)}
              className={`w-full min-h-11 bg-transparent border border-xco-ink px-2 ${labelClass}`}
            >
              {programme.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>
          <TextField label="Kicker" value={content.kicker} onChange={edit("kicker")} hint="What the evening opens — shown as [KICKER]" />
          <TextField label="Title" value={content.title} onChange={edit("title")} multiline />
          <TextField label="Subtitle" value={content.subtitle} onChange={edit("subtitle")} multiline />
          <TextField label="Date" value={content.date} onChange={edit("date")} hint="Only 18 Sept and 8 Oct are fixed — keep “tbc” until a date is." />
          <TextField label="Time" value={content.time} onChange={edit("time")} />
          <TextField label="Location" value={content.location} onChange={edit("location")} />
        </Section>

        <Section title="Template">
          <RadioList name="template" value={template} options={templateList} onChange={chooseTemplate} />
        </Section>

        <Section title="Imagery">
          <RadioList name="imagery" value={imagery} options={imageryList} onChange={setImagery} />
        </Section>

        <Section title="Palette">
          <RadioList name="palette" value={palette} options={paletteList.map((p) => ({ id: p.id, label: p.label }))} onChange={setPalette} />
        </Section>

        <Section title="Title">
          <RadioList name="face" value={titleFace} options={FACES} onChange={setTitleFace} />
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="accent-xco-dusk" />
            <span className={labelClass}>Uppercase</span>
          </label>
        </Section>

        <Section title="Format">
          <RadioList
            name="format"
            value={formatId}
            options={cardFormats.map((f) => ({ id: f.id, label: `${f.label} — ${f.w} × ${f.h}`, hint: f.use }))}
            onChange={setFormatId}
          />
        </Section>

        <Section title="Motion">
          <Button onClick={() => setPlaying((p) => !p)} pressed={playing}>
            {playing ? "❚❚ Pause" : "▶ Play"} — {LOOP_SECONDS}s loop
          </Button>
          <label className="block space-y-1 pt-2">
            <span className={`${labelClass} uppercase tracking-wider`}>Still frame — {Math.round(stillPhase * 100)}%</span>
            <input
              type="range" min={0} max={0.99} step={0.01} value={stillPhase}
              onChange={(e) => { setPlaying(false); setStillPhase(Number(e.target.value)); }}
              className="w-full accent-xco-dusk"
            />
            <p className={`${labelClass} text-xco-ink-muted`}>Where in the loop the still is taken — PNGs export this frame. For the globes, 0% is as drawn and 50% fully resolved.</p>
          </label>
          <Button onClick={() => setSeed((s) => (s * 1103515245 + 12345) >>> 0)}>↻ New field pattern</Button>
        </Section>

        <Section title="Export">
          <div className="space-y-2">
            <Button onClick={exportPNG} disabled={!assets || busy !== null}>
              {busy === "png" ? "exporting…" : `↓ PNG — ${format.w} × ${format.h}`}
            </Button>
            <Button onClick={exportAllPNG} disabled={!assets || busy !== null}>
              {busy === "png-all" ? "exporting…" : "↓ PNG — all four formats"}
            </Button>
            <Button onClick={exportVideo} disabled={!assets || busy !== null || !video}>
              {recording
                ? `recording… ${busy?.split(":")[1] ?? 0}%`
                : video
                  ? `↓ ${video.ext.toUpperCase()} — ${LOOP_SECONDS}s loop`
                  : "Video needs Chrome or Safari"}
            </Button>
            {video?.ext === "webm" && (
              <p className={`${labelClass} text-xco-ink-muted`}>This browser records WebM. For Instagram, export from Chrome or Safari to get MP4.</p>
            )}
            <p role="status" aria-live="polite" className={`${labelClass} text-xco-dusk-ink`}>{message ?? assetError ?? ""}</p>
          </div>
        </Section>
      </aside>

      {/* Preview first on a phone; beside the long controls, and pinned, on desktop. */}
      <div className="flex-1 min-w-0 space-y-4 order-first lg:order-none lg:sticky lg:top-24">
        <div className="border border-xco-ink bg-xco-paper mx-auto" style={{ maxWidth: format.h > format.w ? 560 : undefined }}>
          {assets ? (
            <CardPreview spec={spec} assets={assets} playing={playing && !recording} stillPhase={stillPhase} />
          ) : (
            <div className={`${labelClass} p-8`} style={{ aspectRatio: `${format.w} / ${format.h}` }}>Loading fonts and globe…</div>
          )}
        </div>
        <p className={labelClass}>{format.w} × {format.h} — {format.use}</p>
      </div>
    </div>
  );
}
