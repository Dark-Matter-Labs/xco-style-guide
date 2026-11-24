"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { chaosSystems, generateChaos, type ChaosParams, type ChaosSystem } from "@/lib/chaos/systems";
import { download } from "@/lib/media/export";
import { Button, labelClass, RadioList, Section, TextField } from "@/components/generator-controls";
import { chaosPalettes, type ChaosPaletteId } from "../chaos/render";
import { COVER, drawCover, drawIcon, ICON, initials, SAFE_BAND, SANS, SERIF, seedFrom, type IconGlyph } from "./render";

const GLYPHS: { id: IconGlyph; label: string; hint: string }[] = [
  { id: "monogram", label: "Monogram", hint: "The page's initials, with one ember stop — reads at sidebar size" },
  { id: "x", label: "The x", hint: "The logo's operator alone — for the space's home page" },
  { id: "field", label: "Field", hint: "A crop of the cover's field — loses detail below 40 px" },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "page";

export function NotionGenerator() {
  const [name, setName] = useState("Decisions Log");
  const [seed, setSeed] = useState(() => seedFrom("Decisions Log"));
  const [monogram, setMonogram] = useState<string | null>(null);
  const [system, setSystem] = useState<ChaosSystem>("flow");
  const [chaos, setChaos] = useState(0.35);
  const [palette, setPalette] = useState<ChaosPaletteId>("chalk");
  const [glyph, setGlyph] = useState<IconGlyph>("monogram");
  const [coverTitle, setCoverTitle] = useState(false);
  const [coverLogo, setCoverLogo] = useState(true);
  const [fontsReady, setFontsReady] = useState(false);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // A face that fails to load is not fatal: the assets still draw in the fallback.
    Promise.allSettled([`400 64px ${SERIF}`, `400 64px ${SANS}`].map((f) => document.fonts.load(f))).then(() => setFontsReady(true));
  }, []);

  const params: ChaosParams = useDeferredValue(useMemo(() => ({ system, seed, chaos, density: 1 }), [system, seed, chaos]));
  const result = useMemo(() => generateChaos(params), [params]);
  const mono = monogram ?? initials(name);

  const coverRef = useRef<HTMLCanvasElement>(null);
  const iconRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = coverRef.current?.getContext("2d");
    if (ctx) drawCover(ctx, result, palette, params.seed, { title: coverTitle ? name.trim() || null : null, logo: coverLogo });
  }, [result, palette, params.seed, coverTitle, coverLogo, name, fontsReady]);

  useEffect(() => {
    const c = iconRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    drawIcon(ctx, result, palette, params.seed, glyph, mono);
    setIconUrl(c.toDataURL("image/png"));
  }, [result, palette, params.seed, glyph, mono, fontsReady]);

  function onName(v: string) {
    setName(v);
    setSeed(seedFrom(v));
  }

  async function exportPng(canvas: HTMLCanvasElement | null, file: string) {
    setMessage(null);
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
    if (!blob) return setMessage("PNG encoding failed. Try again, or use another browser.");
    download(blob, file);
  }

  const base = `xco-notion-${slug(name)}-${params.seed}`;
  const stale = params.seed !== seed || params.chaos !== chaos || params.system !== system;
  const description = `Notion assets for “${name}”: a generated ${system} field, seed ${params.seed}. Expressive; it encodes no data.`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <aside className="w-full lg:w-80 shrink-0 space-y-6" aria-label="Notion asset settings">
        <Section title="Page">
          <TextField label="Page name" value={name} onChange={onName} hint="The name seeds the field: the same name always makes the same cover and icon." />
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
              <Button onClick={() => setSeed(seedFrom(name))}>↺ From name</Button>
            </div>
          </div>
        </Section>

        <Section title="Field">
          <RadioList name="system" value={system} options={chaosSystems} onChange={setSystem} />
          <label className="block space-y-1 pt-2">
            <span className={`${labelClass} uppercase tracking-wider`}>Chaos — {Math.round(chaos * 100)}%</span>
            <input type="range" min={0} max={1} step={0.01} value={chaos} onChange={(e) => setChaos(Number(e.target.value))} className="w-full accent-xco-dusk" />
          </label>
          <RadioList name="palette" value={palette} options={chaosPalettes.map((p) => ({ id: p.id, label: p.label }))} onChange={setPalette} />
        </Section>

        <Section title="Cover">
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={coverLogo} onChange={(e) => setCoverLogo(e.target.checked)} className="accent-xco-dusk mt-1.5" />
            <span className={labelClass}>xCO logo</span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={coverTitle} onChange={(e) => setCoverTitle(e.target.checked)} className="accent-xco-dusk mt-1.5" />
            <span>
              <span className={`${labelClass} block`}>Page name on the cover</span>
              <span className={`${labelClass} block text-xco-ink-muted`}>Notion already sets the title below — use for shared or public pages</span>
            </span>
          </label>
        </Section>

        <Section title="Icon">
          <RadioList name="glyph" value={glyph} options={GLYPHS} onChange={setGlyph} />
          {glyph === "monogram" && (
            <TextField label="Letters" value={mono} onChange={(v) => setMonogram(v.slice(0, 3) || null)} hint="Up to three. Clear it to go back to the initials." />
          )}
        </Section>

        <Section title="Export">
          <div className="space-y-2">
            <Button onClick={() => exportPng(coverRef.current, `${base}-cover.png`)} disabled={stale}>↓ Cover PNG — {COVER.w} × {COVER.h}</Button>
            <Button onClick={() => exportPng(iconRef.current, `${base}-icon.png`)} disabled={stale}>↓ Icon PNG — {ICON} × {ICON}</Button>
            <p role="status" aria-live="polite" className={`${labelClass} ${message ? "text-xco-dusk-ink" : "text-xco-ink-muted"}`}>
              {message ?? (stale ? "Updating…" : "In Notion: Change cover → Upload, and icon → Upload.")}
            </p>
          </div>
        </Section>
      </aside>

      <div className="flex-1 min-w-0 space-y-6 order-first lg:order-none lg:sticky lg:top-24">
        <figure className="space-y-2">
          <div className="relative border border-xco-ink">
            <canvas ref={coverRef} width={COVER.w} height={COVER.h} role="img" aria-label={`Cover. ${description}`} className="block w-full h-auto" />
            {/* Shade what a full-width Notion page usually crops away. */}
            <div aria-hidden className="absolute inset-x-0 top-0 bg-xco-ink/25 border-b border-dashed border-xco-paper" style={{ height: `${SAFE_BAND.top * 100}%` }} />
            <div aria-hidden className="absolute inset-x-0 bottom-0 bg-xco-ink/25 border-t border-dashed border-xco-paper" style={{ height: `${(1 - SAFE_BAND.bottom) * 100}%` }} />
          </div>
          <figcaption className={`${labelClass} text-xco-ink-muted`}>
            Cover. The shaded edges are what Notion usually crops on a full-width page; words stay in the clear band.
          </figcaption>
        </figure>

        <figure className="space-y-2">
          <div className="flex items-end gap-6">
            <canvas ref={iconRef} width={ICON} height={ICON} role="img" aria-label={`Icon. ${description}`} className="block w-40 h-40 border border-xco-ink" />
            {iconUrl && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={iconUrl} alt="" width={78} height={78} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={iconUrl} alt="" width={22} height={22} />
              </>
            )}
          </div>
          <figcaption className={`${labelClass} text-xco-ink-muted`}>Icon at 160, 78 (page header) and 22 px (sidebar).</figcaption>
        </figure>
      </div>
    </div>
  );
}
