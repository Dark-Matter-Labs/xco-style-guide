"use client";

import { useEffect, useRef } from "react";
import { drawAscii, type AsciiMode } from "@/app/(generators)/event-series/render/ascii";

// Still frames of each field, drawn by the same renderer the event cards use.
// Still on purpose: the page shows the states; the event-series generator shows them moving.

const FIELDS: { mode: AsciiMode; label: string; meaning: string }[] = [
  { mode: "collapse", label: "Collapse", meaning: "Turbulence, with up to three beacons of hope" },
  { mode: "storm", label: "Storm", meaning: "Rain-bands turning round a calm eye" },
  { mode: "lattice", label: "Lattice", meaning: "The arrival: order over a residual swirl" },
  { mode: "line", label: "Line", meaning: "Listening: jagged, then a ridge, then a swell" },
  { mode: "ripples", label: "Ripples", meaning: "Listening: rings leaving the centre" },
  { mode: "ridges", label: "Ridges", meaning: "Listening: receding ridgelines" },
];

const W = 360;
const H = 240;
const SMALL = "font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink";

function Field({ mode }: { mode: AsciiMode }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let cancelled = false;

    const draw = () => {
      if (cancelled) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const css = getComputedStyle(canvas);
      drawAscii(ctx, { x: 0, y: 0, w: W, h: H }, {
        mode,
        cx: W / 2,
        cy: H / 2,
        radius: H / 2,
        cell: 13, // the site's desktop cell
        color: css.getPropertyValue("--xco-ink").trim(),
        beacon: css.getPropertyValue("--xco-dusk").trim(),
        font: '"Untitled Sans", system-ui, sans-serif',
        phase: 0.15,
        seed: 7,
      });
    };

    // Wait for Untitled Sans, and redraw when the register (light/dark) flips the ink.
    document.fonts.ready.then(draw);
    const observer = new MutationObserver(draw);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "data-register"] });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", draw);
    return () => {
      cancelled = true;
      observer.disconnect();
      scheme.removeEventListener("change", draw);
    };
  }, [mode]);

  return <canvas ref={ref} aria-hidden="true" className="block w-full h-auto" style={{ aspectRatio: `${W} / ${H}` }} />;
}

export function AsciiSpecimens() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
      {FIELDS.map((f) => (
        <figure key={f.mode} className="space-y-3 min-w-0">
          <Field mode={f.mode} />
          <figcaption className={SMALL}>
            <span className="block">{f.label}</span>
            <span className="block text-xco-ink-muted">{f.meaning}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
