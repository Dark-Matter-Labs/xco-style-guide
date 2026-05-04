"use client";

import { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import {
  spacingFromResolution, computeDots, computeOptionFieldDots,
  DIMS, MARK_LINES,
} from "./ImageTreatmentDiagram";
import type { ColorMode, TreatmentFormat, TreatmentMode, SourceDiagram, DiagramVariant } from "./ImageTreatmentDiagram";
import { spatialWeight } from "@/app/(generators)/option-field/OptionFieldDiagram";

const INK   = "#1C1B17";
const PAPER = "#FFFFFF";
const DUSK  = "#F27F3D";
const OCEAN = "#085A8C";

type SourceMode   = "three-regimes" | "option-field" | "photo";
type PhotoPalette = "mono" | "inverted" | "dusk" | "ocean" | "multi";
type CellShape    = "square" | "hbars" | "vbars";

// ── Debounce ──────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, ms: number): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return d;
}

// ── Helpers ───────────────────────────────────────────────────────────────
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

function sampleLum(data: Uint8ClampedArray, cx: number, cy: number, vw: number, vh: number): number {
  const px = clamp(Math.floor(cx), 0, vw - 1);
  const py = clamp(Math.floor(cy), 0, vh - 1);
  const i  = (py * vw + px) * 4;
  return (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
}

function getImageData(img: HTMLImageElement, vw: number, vh: number): ImageData {
  const off = document.createElement("canvas");
  off.width = vw; off.height = vh;
  const ctx = off.getContext("2d")!;
  ctx.drawImage(img, 0, 0, vw, vh);
  return ctx.getImageData(0, 0, vw, vh);
}

// ── Film grain ────────────────────────────────────────────────────────────
function addGrain(ctx: CanvasRenderingContext2D, vw: number, vh: number, intensity = 30) {
  const imgData = ctx.getImageData(0, 0, vw, vh);
  const { data } = imgData;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * intensity;
    data[i]     = clamp(data[i]     + n, 0, 255);
    data[i + 1] = clamp(data[i + 1] + n, 0, 255);
    data[i + 2] = clamp(data[i + 2] + n, 0, 255);
  }
  ctx.putImageData(imgData, 0, 0);
}

// ── Diagram raster (rectangles only) ─────────────────────────────────────
function drawDiagramRaster(
  ctx: CanvasRenderingContext2D,
  vw: number, vh: number,
  dotSpacing: number, fg: string,
  source: "three-regimes" | "option-field",
  cellShape: CellShape,
) {
  const dots = source === "option-field"
    ? computeOptionFieldDots(vw, vh, dotSpacing)
    : computeDots(vw, vh, dotSpacing);
  ctx.fillStyle = fg;
  for (const d of dots) {
    const w = cellShape === "hbars" ? dotSpacing : d.r * 2;
    const h = cellShape === "vbars" ? dotSpacing : d.r * 2;
    ctx.fillRect(d.cx - w / 2, d.cy - h / 2, w, h);
  }
}

// ── Three Regimes: Mark (original geometry) ───────────────────────────────
function drawMarkVariant(ctx: CanvasRenderingContext2D, vw: number, vh: number, fg: string) {
  const padX = vw * 0.10, padY = vh * 0.10;
  const S = Math.min((vw - 2 * padX) / 400, (vh - 2 * padY) / 200);
  const offX = (vw - 400 * S) / 2, offY = (vh - 200 * S) / 2;
  const tx = (x: number, y: number): [number, number] => [offX + x * S, offY + y * S];

  ctx.strokeStyle = DUSK; ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.setLineDash([]);
  for (const [x1, y1, x2, y2] of MARK_LINES) {
    ctx.beginPath(); ctx.moveTo(...tx(x1, y1)); ctx.lineTo(...tx(x2, y2)); ctx.stroke();
  }
  const [mx, my] = tx(200, 116);
  ctx.fillStyle = DUSK; ctx.beginPath(); ctx.arc(mx, my, 3 * S, 0, Math.PI * 2); ctx.fill();

  ctx.lineWidth = 1.2;
  const [frX, frY] = tx(40, 39.5);
  ctx.fillStyle = PAPER; ctx.fillRect(frX, frY, 120 * S, 45 * S);
  ctx.strokeStyle = fg;  ctx.setLineDash([]); ctx.strokeRect(frX, frY, 120 * S, 45 * S);

  const [foX, foY] = tx(240, 39.5);
  ctx.fillStyle = PAPER; ctx.fillRect(foX, foY, 120 * S, 45 * S);
  ctx.strokeStyle = fg;  ctx.strokeRect(foX, foY, 120 * S, 45 * S);

  const [fiX, fiY] = tx(50, 134);
  ctx.fillStyle = PAPER;   ctx.fillRect(fiX, fiY, 300 * S, 46 * S);
  ctx.strokeStyle = OCEAN; ctx.setLineDash([6, 4]);
  ctx.strokeRect(fiX, fiY, 300 * S, 46 * S); ctx.setLineDash([]);
}

// ── Three Regimes: Territories (bold block layout) ─────────────────────────
function drawTerritoriesVariant(ctx: CanvasRenderingContext2D, vw: number, vh: number) {
  const pX = vw * 0.055, pY = vh * 0.07;
  const gap = vw * 0.035;
  const topW = (vw - 2 * pX - gap) / 2;
  const topH = vh * 0.40;
  const topY = pY;
  const connH = vh * 0.08;
  const jX = vw / 2, jY = topY + topH + connH / 2;
  const btmY = topY + topH + connH;
  const btmH = vh - btmY - pY;
  const frX = pX, foCX = pX + topW + gap + topW / 2;

  // Frontier box: OCEAN border, paper fill
  ctx.fillStyle = PAPER;
  ctx.fillRect(frX, topY, topW, topH);
  ctx.strokeStyle = OCEAN; ctx.lineWidth = 1.5; ctx.setLineDash([]);
  ctx.strokeRect(frX, topY, topW, topH);

  // Fortress box: solid INK fill
  ctx.fillStyle = INK;
  ctx.fillRect(pX + topW + gap, topY, topW, topH);

  // Connection lines
  ctx.strokeStyle = DUSK; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(frX + topW / 2, topY + topH); ctx.lineTo(jX, jY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(foCX, topY + topH); ctx.lineTo(jX, jY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(jX, jY); ctx.lineTo(jX, btmY); ctx.stroke();

  // Junction node
  ctx.fillStyle = DUSK;
  ctx.beginPath(); ctx.arc(jX, jY, 5, 0, Math.PI * 2); ctx.fill();

  // Field box: dashed OCEAN border, paper fill
  ctx.fillStyle = PAPER;
  ctx.fillRect(pX, btmY, vw - 2 * pX, btmH);
  ctx.strokeStyle = OCEAN; ctx.setLineDash([8, 5]);
  ctx.strokeRect(pX, btmY, vw - 2 * pX, btmH); ctx.setLineDash([]);
}

// ── Three Regimes: Signal (converging scanline topology) ──────────────────
function drawSignalVariant(
  ctx: CanvasRenderingContext2D,
  vw: number, vh: number,
  fg: string, dotSpacing: number,
) {
  const spacing = Math.max(4, dotSpacing);
  const segW = Math.max(4, Math.round(spacing * 0.85));
  const cx = vw / 2;
  const jY = vh * 0.58;

  ctx.fillStyle = fg;

  for (let y = spacing / 2; y < vh; y += spacing) {
    if (y < jY) {
      const t = y / jY;

      // Left stream (frontier): sparse, converging inward
      for (let x = 0; x < cx; x += segW) {
        const xRel = x / cx;
        const h = spacing * (xRel * 0.55 + t * 0.25) * 0.9;
        if (h > 0.5) ctx.fillRect(x, y - h / 2, segW * 0.85, h);
      }

      // Right stream (fortress): denser, uniform
      for (let x = cx; x < vw; x += segW) {
        const xRel = 1 - (x - cx) / (vw - cx);
        const h = spacing * (0.3 + xRel * 0.45 + t * 0.2) * 0.9;
        if (h > 0.5) ctx.fillRect(x, y - h / 2, segW * 0.85, h);
      }
    } else {
      // Field: spreading bars below junction
      const t = (y - jY) / (vh - jY);
      const half = vw * (0.12 + t * 0.42);
      const h = spacing * (0.4 + t * 0.18);
      for (let x = clamp(cx - half, 0, vw); x < clamp(cx + half, 0, vw); x += segW) {
        ctx.fillRect(x, y - h / 2, segW * 0.85, h);
      }
    }
  }

  // Junction marker
  ctx.fillStyle = DUSK;
  ctx.beginPath(); ctx.arc(cx, jY, Math.max(5, spacing * 0.55), 0, Math.PI * 2); ctx.fill();
}

// ── Option Field scanlines (sharp mode) ───────────────────────────────────
function drawOptionFieldScanlines(
  ctx: CanvasRenderingContext2D,
  vw: number, vh: number,
  fg: string, dotSpacing: number,
) {
  const spacing = Math.max(3, dotSpacing);
  const segW = Math.max(4, Math.round(spacing * 0.85));
  const pad = Math.round(vw * 0.04);
  const maxW = spacing * 1.5;
  const usableW = vw - pad * 2;
  ctx.fillStyle = fg;
  for (let y = spacing / 2; y < vh; y += spacing) {
    const yRel = y / vh;
    for (let x = pad; x < vw - pad; x += segW) {
      const sh = spatialWeight((x - pad) / usableW, yRel, 0.72, 0.60, 0.52, 0.34, maxW);
      ctx.fillRect(x, y - sh / 2, segW, sh);
    }
  }
}

// ── Photo raster ──────────────────────────────────────────────────────────
function drawPhotoRaster(
  ctx: CanvasRenderingContext2D,
  imgData: ImageData,
  vw: number, vh: number,
  dotSpacing: number,
  palette: PhotoPalette,
  cellShape: CellShape,
) {
  const { data } = imgData;
  const maxSz = dotSpacing * 0.9;
  const rw = (dark: number) => cellShape === "hbars" ? dotSpacing : maxSz * dark;
  const rh = (dark: number) => cellShape === "vbars" ? dotSpacing : maxSz * dark;

  if (palette === "multi") {
    ctx.globalCompositeOperation = "multiply";
    const half = dotSpacing * 0.5;

    for (const [color, ox, oy] of [[OCEAN, 0, 0], [DUSK, half, half]] as [string, number, number][]) {
      ctx.fillStyle = color;
      for (let cy = oy + dotSpacing / 2; cy < vh; cy += dotSpacing) {
        for (let cx = ox + dotSpacing / 2; cx < vw; cx += dotSpacing) {
          const dark = 1 - sampleLum(data, cx, cy, vw, vh);
          if (dark > 0.05) {
            const w = rw(dark), h = rh(dark);
            ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
          }
        }
      }
    }

    ctx.globalCompositeOperation = "source-over";
  } else {
    const fg =
      palette === "inverted" ? PAPER :
      palette === "dusk"     ? DUSK  :
      palette === "ocean"    ? OCEAN : INK;
    ctx.fillStyle = fg;

    for (let cy = dotSpacing / 2; cy < vh; cy += dotSpacing) {
      for (let cx = dotSpacing / 2; cx < vw; cx += dotSpacing) {
        const lum  = sampleLum(data, cx, cy, vw, vh);
        const dark = palette === "inverted" ? lum : 1 - lum;
        if (dark > 0.05) {
          const w = rw(dark), h = rh(dark);
          ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
        }
      }
    }
  }
}

// ── Canvas preview ─────────────────────────────────────────────────────────
interface PreviewProps {
  source: SourceMode; mode: TreatmentMode; variant: DiagramVariant;
  resolution: number; colorMode: ColorMode; photoPalette: PhotoPalette;
  uploadedImg: HTMLImageElement | null; grain: boolean;
  format: TreatmentFormat; cellShape: CellShape; showPhoto: boolean;
}

const PreviewCanvas = forwardRef<HTMLCanvasElement, PreviewProps>(
  function PreviewCanvas({ source, mode, variant, resolution, colorMode, photoPalette, uploadedImg, grain, format, cellShape, showPhoto }, ref) {
    const { vw, vh } = DIMS[format];
    const bg = source === "photo"
      ? (photoPalette === "inverted" ? INK : PAPER)
      : (colorMode === "inverted" ? INK : PAPER);
    const fg = colorMode === "inverted" ? PAPER : colorMode === "ember" ? DUSK : INK;
    const dotSpacing = spacingFromResolution(resolution);

    useEffect(() => {
      const canvas = (ref as React.RefObject<HTMLCanvasElement>)?.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, vw, vh);

      if (source === "photo") {
        if (!uploadedImg) return;
        if (showPhoto) ctx.drawImage(uploadedImg, 0, 0, vw, vh);
        const imgData = getImageData(uploadedImg, vw, vh);
        drawPhotoRaster(ctx, imgData, vw, vh, dotSpacing, photoPalette, cellShape);
        if (grain) addGrain(ctx, vw, vh);
        return;
      }

      if (source === "option-field") {
        if (mode === "raster") drawDiagramRaster(ctx, vw, vh, dotSpacing, fg, "option-field", cellShape);
        else drawOptionFieldScanlines(ctx, vw, vh, fg, dotSpacing);
        return;
      }

      // three-regimes
      if (variant === "territories") { drawTerritoriesVariant(ctx, vw, vh); return; }
      if (variant === "signal")      { drawSignalVariant(ctx, vw, vh, fg, dotSpacing); return; }

      // mark
      if (mode === "raster") drawDiagramRaster(ctx, vw, vh, dotSpacing, fg, "three-regimes", cellShape);
      else                   drawMarkVariant(ctx, vw, vh, fg);
    }, [source, mode, variant, dotSpacing, bg, fg, photoPalette, uploadedImg, grain, vw, vh, ref, cellShape, showPhoto]);

    return <canvas ref={ref} width={vw} height={vh} className="w-full h-auto block" />;
  }
);

// ── SVG string builder ────────────────────────────────────────────────────
function buildSVGString(
  source: SourceMode, mode: TreatmentMode, variant: DiagramVariant,
  resolution: number, colorMode: ColorMode, photoPalette: PhotoPalette,
  uploadedImg: HTMLImageElement | null,
  vw: number, vh: number,
  cellShape: CellShape,
  showPhoto: boolean,
): string {
  const bg = source === "photo"
    ? (photoPalette === "inverted" ? INK : PAPER)
    : (colorMode === "inverted" ? INK : PAPER);
  const fg = colorMode === "inverted" ? PAPER : colorMode === "ember" ? DUSK : INK;
  const dotSpacing = spacingFromResolution(resolution);
  let body = "";

  if (source === "photo" && uploadedImg) {
    const imgData = getImageData(uploadedImg, vw, vh);
    const { data } = imgData;
    const maxSz = dotSpacing * 0.9;
    const rw = (dark: number) => cellShape === "hbars" ? dotSpacing : maxSz * dark;
    const rh = (dark: number) => cellShape === "vbars" ? dotSpacing : maxSz * dark;

    let imagePart = "";
    if (showPhoto) {
      const pc = document.createElement("canvas");
      pc.width = vw; pc.height = vh;
      pc.getContext("2d")!.drawImage(uploadedImg, 0, 0, vw, vh);
      imagePart = `<image href="${pc.toDataURL("image/jpeg", 0.85)}" x="0" y="0" width="${vw}" height="${vh}"/>`;
    }

    const parts: string[] = [];

    if (photoPalette === "multi") {
      const half = dotSpacing * 0.5;
      for (const [color, ox, oy] of [[OCEAN, 0, 0], [DUSK, half, half]] as [string, number, number][]) {
        const layerParts: string[] = [];
        for (let cy = oy + dotSpacing / 2; cy < vh; cy += dotSpacing) {
          for (let cx = ox + dotSpacing / 2; cx < vw; cx += dotSpacing) {
            const dark = 1 - sampleLum(data, cx, cy, vw, vh);
            if (dark > 0.05) {
              const w = rw(dark), h = rh(dark);
              layerParts.push(`<rect x="${(cx-w/2).toFixed(1)}" y="${(cy-h/2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${color}"/>`);
            }
          }
        }
        parts.push(`<g style="mix-blend-mode:multiply">${layerParts.join("")}</g>`);
      }
    } else {
      const svgFg = photoPalette === "inverted" ? PAPER : photoPalette === "dusk" ? DUSK : photoPalette === "ocean" ? OCEAN : INK;
      for (let cy = dotSpacing / 2; cy < vh; cy += dotSpacing) {
        for (let cx = dotSpacing / 2; cx < vw; cx += dotSpacing) {
          const lum  = sampleLum(data, cx, cy, vw, vh);
          const dark = photoPalette === "inverted" ? lum : 1 - lum;
          if (dark > 0.05) {
            const w = rw(dark), h = rh(dark);
            parts.push(`<rect x="${(cx-w/2).toFixed(1)}" y="${(cy-h/2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${svgFg}"/>`);
          }
        }
      }
    }
    body = imagePart + parts.join("");

  } else if (source === "option-field") {
    if (mode === "raster") {
      body = computeOptionFieldDots(vw, vh, dotSpacing).map((d) => {
        const w = cellShape === "hbars" ? dotSpacing : d.r * 2;
        const h = cellShape === "vbars" ? dotSpacing : d.r * 2;
        return `<rect x="${(d.cx-w/2).toFixed(1)}" y="${(d.cy-h/2).toFixed(1)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="${fg}"/>`;
      }).join("");
    } else {
      const spacing = Math.max(3, dotSpacing);
      const segW = Math.max(4, Math.round(spacing * 0.85));
      const pad = Math.round(vw * 0.04);
      const maxW = spacing * 1.5;
      const usableW = vw - pad * 2;
      const parts: string[] = [];
      for (let y = spacing / 2; y < vh; y += spacing) {
        const yRel = y / vh;
        for (let x = pad; x < vw - pad; x += segW) {
          const sh = spatialWeight((x - pad) / usableW, yRel, 0.72, 0.60, 0.52, 0.34, maxW);
          parts.push(`<rect x="${x}" y="${(y-sh/2).toFixed(1)}" width="${segW}" height="${sh.toFixed(1)}" fill="${fg}"/>`);
        }
      }
      body = parts.join("");
    }

  } else {
    // three-regimes
    if (variant === "territories") {
      const pX = vw * 0.055, pY = vh * 0.07;
      const gap = vw * 0.035;
      const topW = (vw - 2 * pX - gap) / 2;
      const topH = vh * 0.40;
      const topY = pY;
      const connH = vh * 0.08;
      const jX = vw / 2, jY = topY + topH + connH / 2;
      const btmY = topY + topH + connH;
      const btmH = vh - btmY - pY;
      const frX = pX, foX = pX + topW + gap;
      const frCX = frX + topW / 2, foCX = foX + topW / 2;
      body =
        `<rect x="${frX.toFixed(1)}" y="${topY.toFixed(1)}" width="${topW.toFixed(1)}" height="${topH.toFixed(1)}" fill="${PAPER}" stroke="${OCEAN}" stroke-width="1.5"/>` +
        `<rect x="${foX.toFixed(1)}" y="${topY.toFixed(1)}" width="${topW.toFixed(1)}" height="${topH.toFixed(1)}" fill="${INK}"/>` +
        `<line x1="${frCX.toFixed(1)}" y1="${(topY+topH).toFixed(1)}" x2="${jX.toFixed(1)}" y2="${jY.toFixed(1)}" stroke="${DUSK}" stroke-width="1.5"/>` +
        `<line x1="${foCX.toFixed(1)}" y1="${(topY+topH).toFixed(1)}" x2="${jX.toFixed(1)}" y2="${jY.toFixed(1)}" stroke="${DUSK}" stroke-width="1.5"/>` +
        `<line x1="${jX.toFixed(1)}" y1="${jY.toFixed(1)}" x2="${jX.toFixed(1)}" y2="${btmY.toFixed(1)}" stroke="${DUSK}" stroke-width="1.5"/>` +
        `<circle cx="${jX.toFixed(1)}" cy="${jY.toFixed(1)}" r="5" fill="${DUSK}"/>` +
        `<rect x="${pX.toFixed(1)}" y="${btmY.toFixed(1)}" width="${(vw-2*pX).toFixed(1)}" height="${btmH.toFixed(1)}" fill="${PAPER}" stroke="${OCEAN}" stroke-width="1.5" stroke-dasharray="8 5"/>`;

    } else if (variant === "signal") {
      const spacing = Math.max(4, dotSpacing);
      const segW = Math.max(4, Math.round(spacing * 0.85));
      const cx = vw / 2, jY = vh * 0.58;
      const parts: string[] = [];
      for (let y = spacing / 2; y < vh; y += spacing) {
        if (y < jY) {
          const t = y / jY;
          for (let x = 0; x < cx; x += segW) {
            const h = spacing * (x / cx * 0.55 + t * 0.25) * 0.9;
            if (h > 0.5) parts.push(`<rect x="${x}" y="${(y-h/2).toFixed(1)}" width="${(segW*0.85).toFixed(1)}" height="${h.toFixed(1)}" fill="${fg}"/>`);
          }
          for (let x = cx; x < vw; x += segW) {
            const h = spacing * (0.3 + (1-(x-cx)/(vw-cx)) * 0.45 + t * 0.2) * 0.9;
            if (h > 0.5) parts.push(`<rect x="${x}" y="${(y-h/2).toFixed(1)}" width="${(segW*0.85).toFixed(1)}" height="${h.toFixed(1)}" fill="${fg}"/>`);
          }
        } else {
          const t = (y - jY) / (vh - jY);
          const half = vw * (0.12 + t * 0.42);
          const h = spacing * (0.4 + t * 0.18);
          const xStart = clamp(cx - half, 0, vw);
          const xEnd   = clamp(cx + half, 0, vw);
          for (let x = xStart; x < xEnd; x += segW) {
            parts.push(`<rect x="${x}" y="${(y-h/2).toFixed(1)}" width="${(segW*0.85).toFixed(1)}" height="${h.toFixed(1)}" fill="${fg}"/>`);
          }
        }
      }
      parts.push(`<circle cx="${cx.toFixed(1)}" cy="${jY.toFixed(1)}" r="${Math.max(5, dotSpacing * 0.55).toFixed(1)}" fill="${DUSK}"/>`);
      body = parts.join("");

    } else {
      // mark variant
      if (mode === "raster") {
        body = computeDots(vw, vh, dotSpacing).map((d) => {
          const w = cellShape === "hbars" ? dotSpacing : d.r * 2;
          const h = cellShape === "vbars" ? dotSpacing : d.r * 2;
          return `<rect x="${(d.cx-w/2).toFixed(1)}" y="${(d.cy-h/2).toFixed(1)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="${fg}"/>`;
        }).join("");
      } else {
        const padX = vw * 0.10, padY = vh * 0.10;
        const S = Math.min((vw - 2 * padX) / 400, (vh - 2 * padY) / 200);
        const offX = (vw - 400 * S) / 2, offY = (vh - 200 * S) / 2;
        const tx = (x: number, y: number) => [`${offX + x * S}`, `${offY + y * S}`] as [string, string];
        const [mx, my] = [offX + 200 * S, offY + 116 * S];
        body = MARK_LINES.map(([x1, y1, x2, y2]) => {
          const [px1, py1] = tx(x1, y1); const [px2, py2] = tx(x2, y2);
          return `<line x1="${px1}" y1="${py1}" x2="${px2}" y2="${py2}" stroke="${DUSK}" stroke-width="1.5" stroke-linecap="round"/>`;
        }).join("") +
          `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="${(3*S).toFixed(1)}" fill="${DUSK}"/>` +
          `<rect x="${(offX+40*S).toFixed(1)}" y="${(offY+39.5*S).toFixed(1)}" width="${(120*S).toFixed(1)}" height="${(45*S).toFixed(1)}" fill="${PAPER}" stroke="${fg}" stroke-width="1.2"/>` +
          `<rect x="${(offX+240*S).toFixed(1)}" y="${(offY+39.5*S).toFixed(1)}" width="${(120*S).toFixed(1)}" height="${(45*S).toFixed(1)}" fill="${PAPER}" stroke="${fg}" stroke-width="1.2"/>` +
          `<rect x="${(offX+50*S).toFixed(1)}" y="${(offY+134*S).toFixed(1)}" width="${(300*S).toFixed(1)}" height="${(46*S).toFixed(1)}" fill="${PAPER}" stroke="${OCEAN}" stroke-width="1.2" stroke-dasharray="6 4"/>`;
      }
    }
  }

  return `<?xml version="1.0" standalone="no"?><svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg"><rect width="${vw}" height="${vh}" fill="${bg}"/>${body}</svg>`;
}

// ── Download helpers ───────────────────────────────────────────────────────
function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function downloadDataURL(dataURL: string, name: string) {
  const a = document.createElement("a"); a.href = dataURL; a.download = name; a.click();
}

// ── Statics ───────────────────────────────────────────────────────────────
const FORMATS: { id: TreatmentFormat; label: string; w: number; h: number }[] = [
  { id: "card",   label: "1200 × 630",  w: 1200, h: 630  },
  { id: "square", label: "1200 × 1200", w: 1200, h: 1200 },
];

const COLOR_MODES: { id: ColorMode; label: string }[] = [
  { id: "ink",      label: "Ink on paper" },
  { id: "ember",    label: "Dusk on paper" },
  { id: "inverted", label: "Paper on ink" },
];

const PHOTO_PALETTES: { id: PhotoPalette; label: string }[] = [
  { id: "mono",     label: "Mono — ink on paper" },
  { id: "inverted", label: "Mono — paper on ink" },
  { id: "dusk",     label: "Dusk (orange)" },
  { id: "ocean",    label: "Ocean (blue)" },
  { id: "multi",    label: "Multi-colour — Karel Martens" },
];

// ── Generator ─────────────────────────────────────────────────────────────
export function ImageTreatmentGenerator() {
  const [source,       setSource]       = useState<SourceMode>("three-regimes");
  const [variant,      setVariant]      = useState<DiagramVariant>("mark");
  const [mode,         setMode]         = useState<TreatmentMode>("raster");
  const [resolution,   setResolution]   = useState(30);
  const [colorMode,    setColorMode]    = useState<ColorMode>("ink");
  const [photoPalette, setPhotoPalette] = useState<PhotoPalette>("mono");
  const [grain,        setGrain]        = useState(false);
  const [cellShape,    setCellShape]    = useState<CellShape>("square");
  const [showPhoto,    setShowPhoto]    = useState(true);
  const [format,       setFormat]       = useState<TreatmentFormat>("card");
  const [uploadedImg,  setUploadedImg]  = useState<HTMLImageElement | null>(null);
  const [exporting,    setExporting]    = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debouncedResolution = useDebounce(resolution, 120);
  const activeFormat = FORMATS.find((f) => f.id === format)!;
  const dotSpacing = spacingFromResolution(debouncedResolution);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { setUploadedImg(img); URL.revokeObjectURL(url); };
    img.src = url;
  }, []);

  // True when resolution slider / grain should be shown
  const showResolution = source === "photo" ||
    (source === "three-regimes" && (variant === "signal" || mode === "raster")) ||
    (source === "option-field");

  const showMode = source !== "photo" && !(source === "three-regimes" && variant !== "mark");

  const slug = `xco-treatment-${format}-${source === "photo" ? `photo-${photoPalette}` : `${source === "three-regimes" ? variant : source}-${mode === "raster" ? `r${debouncedResolution}` : "sharp"}`}`;

  const handle = async (type: string) => {
    setExporting(type);
    try {
      const { w, h } = activeFormat;

      // Photo PNG: use canvas directly (no server route needed)
      if (source === "photo" && type === "png") {
        const canvas = canvasRef.current;
        if (canvas) downloadDataURL(canvas.toDataURL("image/png"), `${slug}.png`);
        return;
      }

      const svgStr = buildSVGString(source, mode, variant, debouncedResolution, colorMode, photoPalette, uploadedImg, w, h, cellShape, showPhoto);

      if (type === "svg") {
        downloadBlob(new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" }), `${slug}.svg`);
      }
      if (type === "png") {
        const res = await fetch("/api/export/png", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ svg: svgStr, width: w, height: h }),
        });
        if (res.ok) downloadBlob(await res.blob(), `${slug}.png`);
      }
    } finally {
      setExporting(null);
    }
  };

  const previewProps: PreviewProps = {
    source, mode, variant, resolution: debouncedResolution,
    colorMode, photoPalette, uploadedImg, grain, format, cellShape, showPhoto,
  };

  const btnClass = (active: boolean) =>
    `flex-1 font-mono text-xs px-3 py-2 border transition-colors ${
      active
        ? "bg-xco-ink text-xco-paper border-xco-ink"
        : "text-xco-ink-muted border-xco-ink/[0.2] hover:border-xco-ink hover:text-xco-ink"
    }`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Controls */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">

        {/* Source */}
        <div className="space-y-2">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Source</h2>
          <div className="flex gap-0 flex-wrap">
            {(["three-regimes", "option-field", "photo"] as SourceMode[]).map((s) => (
              <button key={s} onClick={() => setSource(s)} className={btnClass(source === s)}>
                {s === "three-regimes" ? "Three Regimes" : s === "option-field" ? "Option Field" : "Photo ↑"}
              </button>
            ))}
          </div>
        </div>

        {/* Photo upload */}
        {source === "photo" && (
          <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
            <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Image</h2>
            <label className={`block border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${uploadedImg ? "border-xco-ink/[0.4]" : "border-xco-ink/[0.2] hover:border-xco-ink/[0.5]"}`}>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <span className="font-mono text-xs text-xco-ink-muted">
                {uploadedImg ? "Photo loaded — click to replace" : "Click to upload photo"}
              </span>
            </label>
            {uploadedImg && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showPhoto} onChange={(e) => setShowPhoto(e.target.checked)}
                  className="accent-xco-dusk w-4 h-4" />
                <span className="font-mono text-xs text-xco-ink">Show source photo</span>
              </label>
            )}
          </div>
        )}

        {/* Diagram variant (three-regimes only) */}
        {source === "three-regimes" && (
          <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
            <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Variant</h2>
            <div className="flex gap-0">
              {(["mark", "territories", "signal"] as DiagramVariant[]).map((v) => (
                <button key={v} onClick={() => setVariant(v)} className={btnClass(variant === v)}>
                  {v}
                </button>
              ))}
            </div>
            <p className="font-mono text-xs text-xco-ink-muted italic">
              {variant === "mark"        && "Original geometric mark — sources converging to field"}
              {variant === "territories" && "Three regime zones — block diagram layout"}
              {variant === "signal"      && "Scanline topology — two streams merging into one"}
            </p>
          </div>
        )}

        {/* Mode (raster / sharp) — only where applicable */}
        {showMode && (
          <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
            <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Mode</h2>
            <div className="flex gap-0">
              {(["raster", "sharp"] as TreatmentMode[]).map((m) => (
                <button key={m} onClick={() => setMode(m)} className={btnClass(mode === m)}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resolution */}
        {showResolution && (
          <div className="space-y-3 border-t border-xco-ink/[0.12] pt-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Resolution</h2>
              <span className="font-mono text-xs text-xco-dusk">{dotSpacing}px grid</span>
            </div>
            <input type="range" min={0} max={100} step={1}
              value={resolution} onChange={(e) => setResolution(Number(e.target.value))}
              className="w-full accent-xco-dusk" />
            <div className="flex justify-between font-mono text-xs text-xco-ink-muted">
              <span>coarse</span><span>fine</span>
            </div>
            {source !== "photo" && (
              <p className="font-mono text-xs text-xco-ink-muted italic">
                {resolution <= 20 && "Abstract texture — mark unreadable"}
                {resolution > 20 && resolution <= 45 && "Suggested: placeholder / teaser"}
                {resolution > 45 && resolution <= 70 && "Suggested: evolving state"}
                {resolution > 70 && "Mark readable — approaching sharp"}
              </p>
            )}
          </div>
        )}

        {/* Cell shape — photo and diagram raster (not territories/signal which have fixed geometry) */}
        {(source === "photo" || (mode === "raster" && !(source === "three-regimes" && variant !== "mark"))) && (
          <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
            <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Cell Shape</h2>
            <div className="flex gap-0">
              {([
                { id: "square", label: "Square" },
                { id: "hbars",  label: "H bars"  },
                { id: "vbars",  label: "V bars"  },
              ] as { id: CellShape; label: string }[]).map(({ id, label }) => (
                <button key={id} onClick={() => setCellShape(id)} className={btnClass(cellShape === id)}>
                  {label}
                </button>
              ))}
            </div>
            <p className="font-mono text-xs text-xco-ink-muted italic">
              {cellShape === "square" && "Equal width & height — classic halftone"}
              {cellShape === "hbars"  && "Full column width — horizontal bars"}
              {cellShape === "vbars"  && "Full row height — vertical bars"}
            </p>
          </div>
        )}

        {/* Colour — diagram */}
        {source !== "photo" && (
          <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
            <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Colour</h2>
            {COLOR_MODES.map(({ id, label }) => (
              <label key={id} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="color" value={id} checked={colorMode === id}
                  onChange={() => setColorMode(id)} className="accent-xco-dusk" />
                <span className="font-mono text-xs text-xco-ink">{label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Palette — photo */}
        {source === "photo" && (
          <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
            <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Palette</h2>
            {PHOTO_PALETTES.map(({ id, label }) => (
              <label key={id} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="photo-palette" value={id} checked={photoPalette === id}
                  onChange={() => setPhotoPalette(id)} className="accent-xco-dusk" />
                <span className="font-mono text-xs text-xco-ink">{label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Grain — photo only */}
        {source === "photo" && (
          <div className="border-t border-xco-ink/[0.12] pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={grain} onChange={(e) => setGrain(e.target.checked)}
                className="accent-xco-dusk" />
              <span className="font-mono text-xs text-xco-ink">Film grain</span>
            </label>
            <p className="font-mono text-xs text-xco-ink-muted italic mt-1">
              Adds photographic noise — organic, less cold
            </p>
          </div>
        )}

        {/* Format */}
        <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted">Format</h2>
          {FORMATS.map(({ id, label }) => (
            <label key={id} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="format" value={id} checked={format === id}
                onChange={() => setFormat(id)} className="accent-xco-dusk" />
              <span className="font-mono text-xs text-xco-ink">{label}</span>
            </label>
          ))}
        </div>

        {/* Export */}
        <div className="space-y-2 border-t border-xco-ink/[0.12] pt-4">
          <h2 className="font-ui text-xs tracking-widest uppercase text-xco-ink-muted mb-3">Export</h2>
          <button onClick={() => handle("svg")}
            disabled={exporting !== null || (source === "photo" && !uploadedImg)}
            className="w-full text-left font-mono text-xs text-xco-ink border border-xco-ink/[0.2] px-3 py-2 hover:border-xco-ink hover:bg-xco-ink/[0.04] transition-colors disabled:opacity-40">
            {exporting === "svg" ? "exporting…" : `↓ SVG — ${activeFormat.label}`}
          </button>
          <button
            onClick={() => handle("png")}
            disabled={exporting !== null || (source === "photo" && !uploadedImg)}
            className="w-full text-left font-mono text-xs text-xco-ink border border-xco-ink/[0.2] px-3 py-2 hover:border-xco-ink hover:bg-xco-ink/[0.04] transition-colors disabled:opacity-40">
            {exporting === "png" ? "exporting…" : `↓ PNG — ${activeFormat.label}`}
          </button>
          {source === "photo" && !uploadedImg && (
            <p className="font-mono text-xs text-xco-ink-muted italic">Upload a photo to enable export</p>
          )}
        </div>
      </aside>

      {/* Preview */}
      <div className="flex-1 min-w-0 space-y-4">
        {source === "photo" && !uploadedImg ? (
          <div className="border border-xco-ink/[0.12] flex items-center justify-center"
            style={{ aspectRatio: format === "card" ? "1200/630" : "1" }}>
            <span className="font-mono text-xs text-xco-ink-muted">Upload a photo to preview</span>
          </div>
        ) : (
          <div className="border border-xco-ink/[0.12] overflow-hidden"
            style={{ background: source === "photo" ? (photoPalette === "inverted" ? INK : PAPER) : (colorMode === "inverted" ? INK : PAPER) }}>
            <PreviewCanvas ref={canvasRef} {...previewProps} />
          </div>
        )}
        <p className="font-mono text-xs text-xco-ink-muted">
          {source === "photo"
            ? `${dotSpacing}px raster grid · ${format === "card" ? "1200×630" : "1200×1200"}`
            : source === "option-field"
              ? `Option field · ${format === "card" ? "1200×630" : "1200×1200"}`
              : `Three Regimes — ${variant} · ${format === "card" ? "1200×630" : "1200×1200"}`}
        </p>
      </div>
    </div>
  );
}
