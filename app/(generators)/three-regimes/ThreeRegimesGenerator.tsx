"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMinute, useSettled } from "@/components/xco/TimePrint";
import { TIME_PRINT_HINT } from "@/lib/asemic/time-print";
import {
  Button, Checkbox, ExportError, labelClass, RadioList, Section, Segmented, useExport,
} from "@/components/generator-controls";
import { exportPNG, exportSVG } from "@/lib/media/export";
import { useStructureView } from "./StructureView";
import { useFieldView } from "./FieldView";
import { useTerritoryView } from "./TerritoryView";

type ViewId = "structure" | "field" | "territory";

const VIEWS: { id: ViewId; label: string }[] = [
  { id: "structure", label: "Structure" },
  { id: "field", label: "Field" },
  { id: "territory", label: "Territory" },
];

/**
 * One Three Regimes instrument (D15): Structure, Field and Territory are views
 * of the same Frontier, Fortress and Field idea. Every view keeps its state
 * while another is shown. The instrument owns the format, the export and the
 * one minute the time print takes; Territory and the mark carry no print.
 */
export function ThreeRegimesGenerator() {
  const views = { structure: useStructureView(), field: useFieldView(), territory: useTerritoryView() };
  const [viewId, setViewId] = useState<ViewId>("structure");
  const view = views[viewId];
  const [formatId, setFormatId] = useState("hero");
  const format = view.formats.find((f) => f.id === formatId) ?? view.formats[0];

  // Old /option-field and /territory links arrive as ?view=field and ?view=territory.
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("view");
    if (v === "field" || v === "territory") setViewId(v);
  }, []);
  const chooseView = (v: ViewId) => {
    setViewId(v);
    window.history.replaceState(null, "", v === "structure" ? window.location.pathname : `?view=${v}`);
  };

  const [timePrintOn, setTimePrintOn] = useState(true);
  // One minute for the preview and the hidden export copy, so the export matches what's shown.
  const minute = useMinute();
  // Settled: the print regrows once typing pauses, so keystrokes never wait on it.
  const words = useSettled(view.words);
  const timePrint = useMemo(
    () => (timePrintOn && minute && words !== null ? { minute, words } : null),
    [timePrintOn, minute, words],
  );

  const exportRef = useRef<SVGSVGElement>(null);
  const { busy, error, run } = useExport();
  const handle = (type: "svg" | "png") =>
    run(type, () => {
      const name = `${view.file}-${format.id}`;
      return type === "svg"
        ? exportSVG(exportRef.current, `${name}.svg`)
        : exportPNG(exportRef.current, format.w, format.h, `${name}.png`);
    });

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <aside className="w-full lg:w-72 shrink-0 space-y-6">
        <Section title="View">
          <Segmented value={viewId} options={VIEWS} onChange={chooseView} />
        </Section>

        {view.controls}

        <Section title="Format">
          <RadioList name="format" value={format.id} options={view.formats} onChange={setFormatId} />
        </Section>

        <Section title="Export">
          {view.words === null ? (
            <p className={`${labelClass} text-xco-ink-muted`}>Territory carries no time print.</p>
          ) : (
            <Checkbox label="Time print" hint={`${TIME_PRINT_HINT} Never on the mark.`} checked={timePrintOn} onChange={setTimePrintOn} />
          )}
          <Button onClick={() => handle("svg")} disabled={busy !== null}>
            {busy === "svg" ? "exporting…" : `↓ SVG — ${format.w} × ${format.h}`}
          </Button>
          <Button onClick={() => handle("png")} disabled={busy !== null}>
            {busy === "png" ? "exporting…" : `↓ PNG — ${format.w} × ${format.h}`}
          </Button>
          <p className={`${labelClass} text-xco-ink-muted`}>
            PNG labels render in DM Mono until the export can load Untitled Sans; the SVG keeps the real faces.
          </p>
          <ExportError error={error} />
        </Section>
      </aside>

      <div className="flex-1 min-w-0 space-y-4">
        <div className="border border-xco-ink overflow-hidden" style={{ background: view.ground }}>
          {view.draw(format.id, timePrint)}
        </div>
        <p className={labelClass}>{view.caption(format.id)}</p>
      </div>

      {/* The export copy, at the chosen format's own size */}
      <div className="sr-only" aria-hidden="true">
        {view.draw(format.id, timePrint, exportRef)}
      </div>
    </div>
  );
}
