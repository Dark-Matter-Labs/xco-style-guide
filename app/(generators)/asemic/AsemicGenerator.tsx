"use client";

// The asemic generator: xCO text written as an asemic sheet, previewed and
// exported. The preview and every export read the same memoised sheet, so what
// you download is what you see.

import { useMemo, useState } from "react";
import { Button, labelClass, RadioList, Section, TextField } from "@/components/generator-controls";
import { download } from "@/lib/media/record-video";
import { DENSITY, toSvg, writeSheet, type Register } from "@/lib/asemic/script";
import { SOURCES, type SourceId } from "@/lib/asemic/sources";

type Source = SourceId | "own";
type Density = keyof typeof DENSITY;

const FORMATS = [
  { id: "square", label: "Square sheet — 300 × 300 mm", w: 1000, h: 1000, physical: { w: "300mm", h: "300mm" } },
  { id: "a4", label: "A4 portrait", w: 840, h: 1188, physical: { w: "210mm", h: "297mm" } },
  { id: "social", label: "Social — 4:5", w: 1080, h: 1350, physical: undefined },
] as const;
type FormatId = (typeof FORMATS)[number]["id"];

const RULES = [
  "It is writing with no fixed meaning. Never use it where a reader needs words or data.",
  "It grows from real xCO text. Name the source when you share it.",
  "It is not a code. The same word never looks the same twice.",
  "Only the x carries dusk.",
  "Generated and expressive. It encodes no data.",
];

const HAS_LETTER = new RegExp("\\p{L}", "u");

export function AsemicGenerator() {
  const [source, setSource] = useState<Source>("tone");
  const [own, setOwn] = useState("");
  const [seed, setSeed] = useState(7);
  const [rows, setRows] = useState(20);
  const [density, setDensity] = useState<Density>("normal");
  const [formatId, setFormatId] = useState<FormatId>("square");
  const [register, setRegister] = useState<Register>("paper");
  const [showSource, setShowSource] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const preset = SOURCES.find((s) => s.id === source);
  const text = preset ? preset.text : own;
  const sourceLabel = preset ? preset.label.toLowerCase() : "your own text";
  const format = FORMATS.find((f) => f.id === formatId) ?? FORMATS[0];
  const hasWords = HAS_LETTER.test(text);

  const sheet = useMemo(
    () => writeSheet(text, {
      width: format.w,
      height: format.h,
      margin: Math.round(Math.min(format.w, format.h) * 0.07),
      rows,
      seed: String(seed),
      density: DENSITY[density],
    }),
    [text, format, rows, seed, density],
  );
  const description = `Asemic writing grown from ${sourceLabel}, seed ${seed}, ${rows} rows. It has no readable text. Generated and expressive; it encodes no data.`;
  const svg = useMemo(() => toSvg(sheet, register, description, format.physical), [sheet, register, description, format]);
  const name = `xco-asemic-${source}-${seed}-${formatId}-${register}`;

  const exportSvg = () => download(new Blob([svg], { type: "image/svg+xml" }), `${name}.svg`);
  const exportPng = async () => {
    setBusy(true);
    setMessage(null);
    try {
      // The rasteriser takes pixel sizes, so the PNG uses the sheet's own pixel dimensions.
      const res = await fetch("/api/export/png", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ svg: toSvg(sheet, register, description), width: format.w, height: format.h }),
      });
      if (!res.ok) throw new Error(String(res.status));
      download(await res.blob(), `${name}.png`);
    } catch {
      setMessage("PNG export failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <aside className="w-full lg:w-80 shrink-0 space-y-6" aria-label="Asemic settings">
        <Section title="Source">
          <RadioList
            name="source"
            value={source}
            options={[...SOURCES.map((s) => ({ id: s.id as Source, label: s.label })), { id: "own" as Source, label: "Your own text" }]}
            onChange={setSource}
          />
          {source === "own" && (
            <TextField label="Your text" value={own} onChange={setOwn} multiline hint="A line break becomes a rest on the thread." />
          )}
        </Section>

        <Section title="Writing">
          <div className="flex items-end gap-3">
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
            <div className="w-40">
              <Button onClick={() => setSeed(1 + Math.floor(Math.random() * 9999))}>↻ Write it again</Button>
            </div>
          </div>
          <p className={`${labelClass} text-xco-ink-muted`}>The same text, seed and settings always write the same sheet.</p>
          <label className="block space-y-1 pt-2">
            <span className={`${labelClass} uppercase tracking-wider`}>Rows — {rows}</span>
            <input type="range" min={8} max={30} step={1} value={rows} onChange={(e) => setRows(Number(e.target.value))} className="w-full accent-xco-dusk" />
          </label>
          <fieldset className="pt-2 space-y-1">
            <legend className={`${labelClass} uppercase tracking-wider`}>Density</legend>
            <RadioList
              name="density"
              value={density}
              options={[{ id: "sparse", label: "Sparse" }, { id: "normal", label: "Normal" }, { id: "dense", label: "Dense" }]}
              onChange={setDensity}
            />
          </fieldset>
        </Section>

        <Section title="Look">
          <RadioList name="format" value={formatId} options={FORMATS.map((f) => ({ id: f.id, label: f.label }))} onChange={setFormatId} />
          <RadioList
            name="register"
            value={register}
            options={[{ id: "paper", label: "Paper — ink on paper" }, { id: "ink", label: "Ink — paper on ink" }]}
            onChange={setRegister}
          />
          <label className="flex items-start gap-2 cursor-pointer pt-2">
            <input type="checkbox" checked={showSource} onChange={(e) => setShowSource(e.target.checked)} className="accent-xco-dusk mt-1.5" />
            <span>
              <span className={`${labelClass} block`}>Show the source</span>
              <span className={`${labelClass} block text-xco-ink-muted`}>Sets each row&apos;s words faintly beneath it. Preview only; never exported.</span>
            </span>
          </label>
        </Section>

        <Section title="Export">
          <div className="space-y-2">
            <Button onClick={exportSvg} disabled={!hasWords || busy}>↓ SVG — for print and pen plotters</Button>
            <Button onClick={exportPng} disabled={!hasWords || busy}>{busy ? "exporting…" : `↓ PNG — ${format.w} × ${format.h}`}</Button>
            <p role="status" aria-live="polite" className={`${labelClass} ${message ? "text-xco-dusk-ink" : "text-xco-ink-muted"}`}>
              {/* The one live region: export errors, or why the exports are off. */}
              {message ?? (hasWords ? "" : "Add some text to write.")}
            </p>
          </div>
        </Section>

        <Section title="Rules">
          <ol className="space-y-2">
            {RULES.map((rule, i) => (
              <li key={rule} className={`${labelClass} grid grid-cols-[2rem_1fr] gap-2`}>
                <span className="text-xco-ink-muted">{String(i + 1).padStart(2, "0")}</span>
                <span>{rule}</span>
              </li>
            ))}
          </ol>
        </Section>
      </aside>

      <div className="flex-1 min-w-0 space-y-4 order-first lg:order-none lg:sticky lg:top-24">
        <div className="border border-xco-ink mx-auto" style={{ maxWidth: format.h > format.w ? 560 : undefined }}>
          {hasWords ? (
            <div className="relative" style={{ aspectRatio: `${format.w} / ${format.h}` }}>
              {/* Generated by lib/asemic from tokens; the only free text, the label, is escaped there. */}
              <div className="[&>svg]:block [&>svg]:w-full [&>svg]:h-auto" dangerouslySetInnerHTML={{ __html: svg }} />
              {showSource && (
                <div aria-hidden className="pointer-events-none absolute inset-0">
                  {sheet.lines.map((line, i) => (
                    <p
                      key={i}
                      className="absolute m-0 truncate font-mono text-[clamp(7px,1vw,11px)] leading-none"
                      style={{
                        left: `${(sheet.margin / sheet.width) * 100}%`,
                        right: `${(sheet.margin / sheet.width) * 100}%`,
                        top: `${((sheet.margin + sheet.rowHeight * (i + 0.5) + sheet.rowHeight * 0.36) / sheet.height) * 100}%`,
                        color: register === "ink" ? "rgba(246,241,229,0.7)" : "rgba(55,78,74,0.85)",
                      }}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center p-10" style={{ aspectRatio: `${format.w} / ${format.h}` }}>
              <p className={`${labelClass} text-xco-ink-muted`}>Add some text to write.</p>
            </div>
          )}
        </div>
        <p className={`${labelClass} text-xco-ink-muted`}>{description}</p>
      </div>
    </div>
  );
}
