"use client";

import { useEffect, useRef } from "react";
import { LOOP_SECONDS } from "@/lib/event-series/formats";
import { drawCard } from "./render/templates";
import type { Assets, CardSpec } from "./render/types";

interface CardPreviewProps {
  spec: CardSpec;
  assets: Assets;
  playing: boolean;
  /** Loop position shown while paused — also the frame PNGs export. */
  stillPhase: number;
}

// The preview draws at the card's true pixel size and lets CSS scale it down,
// so what is on screen is what exports. It animates only while `playing`.
export function CardPreview({ spec, assets, playing, stillPhase }: CardPreviewProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    if (!playing) {
      drawCard(ctx, spec, stillPhase, assets);
      return;
    }
    let raf = 0;
    const start = performance.now() - stillPhase * LOOP_SECONDS * 1000;
    const frame = (now: number) => {
      const phase = (((now - start) / 1000) % LOOP_SECONDS) / LOOP_SECONDS;
      drawCard(ctx, spec, phase, assets);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [spec, assets, playing, stillPhase]);

  const { w, h, label } = spec.format;
  return (
    <canvas
      ref={ref}
      width={w}
      height={h}
      role="img"
      aria-label={`${label} event card: ${spec.content.title}, ${spec.content.date}`}
      className="block w-full h-auto"
      style={{ aspectRatio: `${w} / ${h}` }}
    />
  );
}
