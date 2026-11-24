"use client";

import { useState, useEffect, useMemo, useRef, useCallback, forwardRef } from "react";
import {
  spacingFromResolution, computeDots, computeOptionFieldDots,
  DIMS, MARK_LINES,
} from "./ImageTreatmentDiagram";
import type { CellShape, ColorMode, TreatmentFormat, TreatmentMode, DiagramVariant } from "./ImageTreatmentDiagram";
import { addGrain, clamp, fillRectPixel, getImageData, getPhotoDims, sampleLum } from "./pixels";
import { buildStylePrompt, drawTritone, TRITONE_PRESETS, tritoneSVG, type TritoneOptions, type TritonePreset } from "./tritone";
import { useSettled } from "@/components/xco/TimePrint";
import { embedWeight } from "@/lib/regimes/weight";
import { paletteHex } from "@/lib/design-tokens";
import {
  Button, Checkbox, ExportError, labelClass, RadioList, Section, Segmented, Slider, useExport,
} from "@/components/generator-controls";
import { canvasPNG, download, exportPNG, exportSVG } from "@/lib/media/export";

const { ink: INK, paper: PAPER, dusk: DUSK, ocean: OCEAN } = paletteHex;


type SourceMode   = "three-regimes" | "option-field" | "photo" | "tritone";
type PhotoPalette = "mono" | "inverted" | "dusk" | "ocean" | "multi";

/** The sources that work from uploaded images rather than a diagram. */
const fromPhotos = (s: SourceMode) => s === "photo" || s === "tritone";

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
    fillRectPixel(ctx, d.cx - w / 2, d.cy - h / 2, w, h);
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
        if (h > 0.5) fillRectPixel(ctx, x, y - h / 2, segW * 0.85, h);
      }

      // Right stream (fortress): denser, uniform
      for (let x = cx; x < vw; x += segW) {
        const xRel = 1 - (x - cx) / (vw - cx);
        const h = spacing * (0.3 + xRel * 0.45 + t * 0.2) * 0.9;
        if (h > 0.5) fillRectPixel(ctx, x, y - h / 2, segW * 0.85, h);
      }
    } else {
      // Field: spreading bars below junction
      const t = (y - jY) / (vh - jY);
      const half = vw * (0.12 + t * 0.42);
      const h = spacing * (0.4 + t * 0.18);
      for (let x = clamp(cx - half, 0, vw); x < clamp(cx + half, 0, vw); x += segW) {
        fillRectPixel(ctx, x, y - h / 2, segW * 0.85, h);
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
      const sh = embedWeight((x - pad) / usableW, yRel, maxW);
      fillRectPixel(ctx, x, y - sh / 2, segW, sh);
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
            fillRectPixel(ctx, cx - w / 2, cy - h / 2, w, h);
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
          fillRectPixel(ctx, cx - w / 2, cy - h / 2, w, h);
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
  /** The tritone settings; null unless the source is tritone. */
  tritone: TritoneOptions | null;
}

const PreviewCanvas = forwardRef<HTMLCanvasElement, PreviewProps>(
  function PreviewCanvas({ source, mode, variant, resolution, colorMode, photoPalette, uploadedImg, grain, format, cellShape, showPhoto, tritone }, forwardedRef) {
    // Internal ref for drawing — always a RefObject regardless of what the parent passes.
    // Callback refs (e.g. `ref={(el) => { arr[i] = el; }}`) are NOT RefObjects, so we
    // cannot read `.current` from the forwarded ref. Use localRef for all canvas access.
    const localRef = useRef<HTMLCanvasElement>(null);

    const { vw, vh } = fromPhotos(source) && uploadedImg
      ? getPhotoDims(uploadedImg)
      : DIMS[format];
    const bg = source === "photo"
      ? (photoPalette === "inverted" ? INK : PAPER)
      : (colorMode === "inverted" ? INK : PAPER);
    const fg = colorMode === "inverted" ? PAPER : colorMode === "ember" ? DUSK : INK;
    const dotSpacing = spacingFromResolution(resolution);

    useEffect(() => {
      const canvas = localRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, vw, vh);

      if (source === "tritone") {
        if (uploadedImg && tritone) drawTritone(ctx, uploadedImg, vw, vh, tritone);
        return;
      }

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
    }, [source, mode, variant, dotSpacing, bg, fg, photoPalette, uploadedImg, grain, vw, vh, cellShape, showPhoto, tritone]);

    return (
      <canvas
        ref={(el) => {
          (localRef as React.MutableRefObject<HTMLCanvasElement | null>).current = el;
          if (typeof forwardedRef === "function") {
            forwardedRef(el);
          } else if (forwardedRef) {
            (forwardedRef as React.MutableRefObject<HTMLCanvasElement | null>).current = el;
          }
        }}
        width={vw} height={vh}
        className="w-full h-auto block"
      />
    );
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
  tritone: TritoneOptions | null,
): string {
  if (source === "tritone") {
    if (!uploadedImg || !tritone) throw new Error("Upload an image first.");
    return tritoneSVG(uploadedImg, vw, vh, tritone);
  }
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
          const sh = embedWeight((x - pad) / usableW, yRel, maxW);
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

// ── Statics ───────────────────────────────────────────────────────────────
const FORMATS: { id: TreatmentFormat; label: string; w: number; h: number }[] = [
  { id: "card",   label: "1200 × 630",  w: 1200, h: 630  },
  { id: "square", label: "1200 × 1200", w: 1200, h: 1200 },
];

const SOURCES: { id: SourceMode; label: string }[] = [
  { id: "three-regimes", label: "Three Regimes" },
  { id: "option-field",  label: "Option Field" },
  { id: "photo",         label: "Photo ↑" },
  { id: "tritone",       label: "Tritone ↑" },
];

const TRITONES = (Object.entries(TRITONE_PRESETS) as [TritonePreset, (typeof TRITONE_PRESETS)[TritonePreset]][])
  .map(([id, p]) => ({ id, label: p.label, hint: p.hint }));

const VARIANTS: { id: DiagramVariant; label: string; hint: string }[] = [
  { id: "mark",        label: "Mark",        hint: "Original geometric mark — sources converging to field" },
  { id: "territories", label: "Territories", hint: "Three regime zones — block diagram layout" },
  { id: "signal",      label: "Signal",      hint: "Scanline topology — two streams merging into one" },
];

const MODES: { id: TreatmentMode; label: string }[] = [
  { id: "raster", label: "Raster" },
  { id: "sharp",  label: "Sharp" },
];

const CELL_SHAPES: { id: CellShape; label: string; hint: string }[] = [
  { id: "square", label: "Square", hint: "Equal width & height — classic halftone" },
  { id: "hbars",  label: "H bars", hint: "Full column width — horizontal bars" },
  { id: "vbars",  label: "V bars", hint: "Full row height — vertical bars" },
];

const resolutionHint = (r: number) =>
  r <= 20 ? "Abstract texture — mark unreadable"
  : r <= 45 ? "Suggested: placeholder / teaser"
  : r <= 70 ? "Suggested: evolving state"
  : "Mark readable — approaching sharp";

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
  const [uploadedImgs, setUploadedImgs] = useState<HTMLImageElement[]>([]);
  const [activeIdx,    setActiveIdx]    = useState(0);
  const [animating,    setAnimating]    = useState(false);
  const [animSpeed,    setAnimSpeed]    = useState(2000);
  const [tritonePreset, setTritonePreset] = useState<TritonePreset>("blueprint");
  const [midpoint,     setMidpoint]     = useState(0.35);
  const [highlightRaster, setHighlightRaster] = useState(false);

  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const debouncedResolution = useSettled(resolution, 120);
  const activeFormat = FORMATS.find((f) => f.id === format)!;
  const dotSpacing = spacingFromResolution(debouncedResolution);

  const activeImg = fromPhotos(source) ? (uploadedImgs[activeIdx] ?? null) : null;
  const debouncedMidpoint = useSettled(midpoint, 80);
  const tritone = useMemo<TritoneOptions | null>(
    () => (source === "tritone"
      ? { preset: tritonePreset, midpoint: debouncedMidpoint, raster: highlightRaster ? dotSpacing : null, cellShape, grain }
      : null),
    [source, tritonePreset, debouncedMidpoint, highlightRaster, dotSpacing, cellShape, grain],
  );

  // An old /align link arrives as ?source=tritone.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("source") === "tritone") setSource("tritone");
  }, []);

  const prompt = useExport();
  const [copied, setCopied] = useState(false);
  const copyPrompt = () =>
    prompt.run("prompt", async () => {
      try {
        await navigator.clipboard.writeText(buildStylePrompt(tritonePreset, debouncedMidpoint));
      } catch {
        throw new Error("The browser blocked the clipboard. Try again, or allow clipboard access.");
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setUploadedImgs((prev) => {
          if (prev.length >= 4) return prev;
          return [...prev, img];
        });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
    e.target.value = "";
  }, []);

  useEffect(() => {
    if (!animating || uploadedImgs.length <= 1) return;
    const t = setInterval(() => setActiveIdx((i) => (i + 1) % uploadedImgs.length), animSpeed);
    return () => clearInterval(t);
  }, [animating, uploadedImgs.length, animSpeed]);

  // True when resolution slider / grain should be shown
  const showResolution = source === "photo" || (source === "tritone" && highlightRaster) ||
    (source === "three-regimes" && (variant === "signal" || mode === "raster")) ||
    (source === "option-field");

  const showMode = !fromPhotos(source) && !(source === "three-regimes" && variant !== "mark");

  const slug = source === "tritone"
    ? `xco-treatment-tritone-${tritonePreset}`
    : `xco-treatment-${format}-${source === "photo" ? `photo-${photoPalette}` : `${source === "three-regimes" ? variant : source}-${mode === "raster" ? `r${debouncedResolution}` : "sharp"}`}`;

  const activeDims = activeImg ? getPhotoDims(activeImg) : null;
  const sizeLabel = activeDims ? `${activeDims.vw} × ${activeDims.vh}` : activeFormat.label;

  const { busy: exporting, error, run } = useExport();
  const handle = (type: string) =>
    run(type, async () => {
      const photoDims = fromPhotos(source) && activeImg ? getPhotoDims(activeImg) : null;
      const { w, h } = photoDims
        ? { w: photoDims.vw, h: photoDims.vh }
        : { w: activeFormat.w, h: activeFormat.h };

      // Photo and tritone PNG: use canvas directly
      if (fromPhotos(source) && type === "png") {
        const canvas = canvasRefs.current[activeIdx];
        if (!canvas) throw new Error("The preview has not drawn yet. Wait a moment and try again.");
        download(await canvasPNG(canvas), `${slug}.png`);
        return;
      }

      const svgStr = buildSVGString(source, mode, variant, debouncedResolution, colorMode, photoPalette, activeImg, w, h, cellShape, showPhoto, tritone);
      if (type === "svg") exportSVG(svgStr, `${slug}.svg`);
      else await exportPNG(svgStr, w, h, `${slug}.png`);
    });

  const previewProps: PreviewProps = {
    source, mode, variant, resolution: debouncedResolution,
    colorMode, photoPalette, uploadedImg: activeImg, grain, format, cellShape, showPhoto, tritone,
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Controls */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">
        <Section title="Source">
          <Segmented value={source} options={SOURCES} onChange={setSource} columns={2} />
        </Section>

        {/* Photo upload — multi-image (max 4), for the halftone and tritone sources */}
        {fromPhotos(source) && (
          <Section title={`Images — ${uploadedImgs.length}/4`}>
            {uploadedImgs.map((img, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`${labelClass} flex-1`}>
                  {i + 1} — {img.naturalWidth}×{img.naturalHeight}
                </span>
                <button
                  type="button"
                  aria-label={`Remove image ${i + 1}`}
                  onClick={() => {
                    setUploadedImgs((prev) => prev.filter((_, j) => j !== i));
                    setActiveIdx((a) => Math.min(a, Math.max(0, uploadedImgs.length - 2)));
                  }}
                  className={`${labelClass} min-w-6 min-h-6 hover:text-xco-dusk-ink transition-colors`}
                >
                  ✕
                </button>
              </div>
            ))}
            {uploadedImgs.length < 4 && (
              <label className="block border border-dashed border-xco-ink p-3 text-center cursor-pointer hover:bg-xco-ink/[0.03] transition-colors">
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                <span className={labelClass}>
                  {uploadedImgs.length === 0 ? "Click to upload photos" : "+ Add image"}
                </span>
              </label>
            )}
            {source === "photo" && uploadedImgs.length > 0 && (
              <Checkbox label="Show source photo" checked={showPhoto} onChange={setShowPhoto} />
            )}
            {source === "tritone" && (
              <p className={`${labelClass} text-xco-ink-muted`}>AI outputs, outside diagrams, moodboards: mapped onto three palette stops.</p>
            )}
          </Section>
        )}

        {/* Tritone — the old Align instrument */}
        {source === "tritone" && (
          <>
            <Section title="Tritone palette">
              <RadioList name="tritone" value={tritonePreset} options={TRITONES} onChange={setTritonePreset} />
            </Section>
            <Section title="Contrast">
              <Slider label="Midpoint" min={0.1} max={0.7} step={0.01} value={midpoint} onChange={setMidpoint}
                display={midpoint < 0.3 ? "dark images" : midpoint < 0.5 ? "balanced" : "bright images"} ends={["dark", "bright"]}
                hint="Where shadow turns to midtone. Lower keeps more shadow." />
              <Checkbox label="Highlight raster" hint="Cells in the highlight colour, sized by brightness — textures the structure." checked={highlightRaster} onChange={setHighlightRaster} />
              <Checkbox label="Film grain" hint="Organic noise — softens digital harshness" checked={grain} onChange={setGrain} />
            </Section>
          </>
        )}

        {/* Diagram variant (three-regimes only) */}
        {source === "three-regimes" && (
          <Section title="Variant">
            <Segmented value={variant} options={VARIANTS.map(({ id, label }) => ({ id, label }))} onChange={setVariant} />
            <p className={`${labelClass} text-xco-ink-muted`}>{VARIANTS.find((v) => v.id === variant)!.hint}</p>
          </Section>
        )}

        {/* Mode (raster / sharp) — only where applicable */}
        {showMode && (
          <Section title="Mode">
            <Segmented value={mode} options={MODES} onChange={setMode} />
          </Section>
        )}

        {/* Resolution */}
        {showResolution && (
          <Section title="Resolution">
            <Slider label="Grid" min={0} max={100} step={1} value={resolution} onChange={setResolution}
              display={`${dotSpacing}px grid`} ends={["coarse", "fine"]}
              hint={fromPhotos(source) ? undefined : resolutionHint(resolution)} />
          </Section>
        )}

        {/* Cell shape — photo and diagram raster (not territories/signal which have fixed geometry) */}
        {(source === "photo" || (source === "tritone" ? highlightRaster : mode === "raster" && !(source === "three-regimes" && variant !== "mark"))) && (
          <Section title="Cell shape">
            <Segmented value={cellShape} options={CELL_SHAPES.map(({ id, label }) => ({ id, label }))} onChange={setCellShape} />
            <p className={`${labelClass} text-xco-ink-muted`}>{CELL_SHAPES.find((c) => c.id === cellShape)!.hint}</p>
          </Section>
        )}

        {/* Colour — diagram */}
        {!fromPhotos(source) && (
          <Section title="Colour">
            <RadioList name="color" value={colorMode} options={COLOR_MODES} onChange={setColorMode} />
          </Section>
        )}

        {/* Palette and grain — photo */}
        {source === "photo" && (
          <Section title="Palette">
            <RadioList name="photo-palette" value={photoPalette} options={PHOTO_PALETTES} onChange={setPhotoPalette} />
            <Checkbox label="Film grain" hint="Adds photographic noise — organic, less cold" checked={grain} onChange={setGrain} />
          </Section>
        )}

        {/* Animation — crossfade when multiple photos loaded */}
        {fromPhotos(source) && uploadedImgs.length > 1 && (
          <Section title="Animation">
            <Button onClick={() => setAnimating((a) => !a)} pressed={animating}>
              {animating ? "❚❚ Pause" : "▶ Play"}
            </Button>
            <Slider label="Hold per frame" min={500} max={6000} step={100} value={animSpeed} onChange={setAnimSpeed}
              display={`${(animSpeed / 1000).toFixed(1)}s`} ends={["fast", "slow"]} />
          </Section>
        )}

        {/* Format — not applicable to photos (dims come from the image) */}
        {!fromPhotos(source) && (
          <Section title="Format">
            <RadioList name="format" value={format} options={FORMATS} onChange={setFormat} />
          </Section>
        )}

        {source === "tritone" && (
          <Section title="Style prompt">
            <p className={`${labelClass} text-xco-ink-muted`}>
              Paste into ChatGPT, Midjourney, Firefly or any image generator to ask for this palette and the xCO look.
            </p>
            <Button onClick={copyPrompt} pressed={copied}>
              {copied ? "✓ Copied to clipboard" : `Copy the ${TRITONE_PRESETS[tritonePreset].label} prompt`}
            </Button>
            <ExportError error={prompt.error} />
          </Section>
        )}

        <Section title="Export">
          <Button onClick={() => handle("svg")} disabled={exporting !== null || (fromPhotos(source) && uploadedImgs.length === 0)}>
            {exporting === "svg" ? "exporting…" : `↓ SVG — ${sizeLabel}`}
          </Button>
          <Button onClick={() => handle("png")} disabled={exporting !== null || (fromPhotos(source) && uploadedImgs.length === 0)}>
            {exporting === "png" ? "exporting…" : `↓ PNG — ${fromPhotos(source) && uploadedImgs.length > 1 ? `frame ${activeIdx + 1}/${uploadedImgs.length}` : sizeLabel}`}
          </Button>
          {fromPhotos(source) && uploadedImgs.length === 0 && (
            <p className={labelClass}>Upload a photo to enable export</p>
          )}
          <ExportError error={error} />
        </Section>
      </aside>

      {/* Preview */}
      <div className="flex-1 min-w-0 space-y-4">
        {fromPhotos(source) && uploadedImgs.length === 0 ? (
          <div className="border border-xco-ink flex items-center justify-center"
            style={{ aspectRatio: format === "card" ? "1200/630" : "1" }}>
            <span className={labelClass}>Upload a photo to preview</span>
          </div>
        ) : fromPhotos(source) ? (
          <div className="relative border border-xco-ink overflow-hidden"
            style={{ background: photoPalette === "inverted" ? INK : PAPER }}>
            {uploadedImgs.map((img, i) => (
              <div
                key={i}
                className="transition-opacity duration-700 ease-in-out"
                style={{
                  position: i === 0 ? "relative" : "absolute",
                  top: 0, left: 0, right: 0,
                  opacity: i === activeIdx ? 1 : 0,
                }}
              >
                <PreviewCanvas
                  ref={(el) => { canvasRefs.current[i] = el; }}
                  {...previewProps}
                  uploadedImg={img}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-xco-ink overflow-hidden"
            style={{ background: colorMode === "inverted" ? INK : PAPER }}>
            <PreviewCanvas
              ref={(el) => { canvasRefs.current[0] = el; }}
              {...previewProps}
            />
          </div>
        )}

        {/* Frame picker — shown when multiple images loaded */}
        {fromPhotos(source) && uploadedImgs.length > 1 && (
          <div className="max-w-xs" role="group" aria-label="Frame">
            <Segmented
              value={String(activeIdx)}
              options={uploadedImgs.map((_, i) => ({ id: String(i), label: String(i + 1) }))}
              onChange={(v) => { setActiveIdx(Number(v)); setAnimating(false); }}
            />
          </div>
        )}

        <p className={labelClass}>
          {source === "tritone"
            ? `${TRITONE_PRESETS[tritonePreset].label} tritone · midpoint ${Math.round(midpoint * 100)}%${activeImg ? ` · ${getPhotoDims(activeImg).vw}×${getPhotoDims(activeImg).vh}` : ""}`
            : source === "photo"
            ? uploadedImgs.length > 0
              ? (() => {
                  const img = uploadedImgs[activeIdx];
                  if (!img) return `${dotSpacing}px raster grid`;
                  const d = getPhotoDims(img);
                  return `${dotSpacing}px raster grid · ${d.vw}×${d.vh}${uploadedImgs.length > 1 ? ` · frame ${activeIdx + 1}/${uploadedImgs.length}` : ""}`;
                })()
              : `${dotSpacing}px raster grid`
            : source === "option-field"
              ? `Option field · ${format === "card" ? "1200×630" : "1200×1200"}`
              : `Three Regimes — ${variant} · ${format === "card" ? "1200×630" : "1200×1200"}`}
        </p>
      </div>
    </div>
  );
}
