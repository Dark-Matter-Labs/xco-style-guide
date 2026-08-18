"use client";

import { useState } from "react";
import {
  buildLogoSvg,
  logoGeometry,
  logoVariants,
  descriptorMetrics,
  type LogoVariant,
} from "@/lib/logo";
import { Logo } from "@/components/xco/Logo";

const PNG_SIZES = [512, 1024, 2048] as const;

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function fileStem(variant: LogoVariant, withDescriptor: boolean) {
  return `xco-logo-${variant}${withDescriptor ? "-lockup" : ""}`;
}

export function LogoDownloads() {
  const [variant, setVariant] = useState<LogoVariant>("ink");
  const [withDescriptor, setWithDescriptor] = useState(false);
  const [withBackground, setWithBackground] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const svg = buildLogoSvg({ variant, withDescriptor, withBackground });
  const active = logoVariants.find((v) => v.id === variant)!;

  const downloadSvg = () => {
    setError(null);
    downloadBlob(
      new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
      `${fileStem(variant, withDescriptor)}.svg`,
    );
  };

  const downloadPng = async (size: number) => {
    setError(null);
    setBusy(`png-${size}`);
    try {
      const ratio =
        logoGeometry.width /
        (logoGeometry.height + (withDescriptor ? descriptorMetrics.space : 0));
      const res = await fetch("/api/export/png", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ svg, width: size, height: Math.round(size / ratio) }),
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      downloadBlob(await res.blob(), `${fileStem(variant, withDescriptor)}-${size}.png`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PNG export failed. Try the SVG instead.");
    } finally {
      setBusy(null);
    }
  };

  const copySvg = async () => {
    setError(null);
    try {
      await navigator.clipboard.writeText(svg);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Clipboard blocked by the browser. Use the SVG download instead.");
    }
  };

  const btn =
    "font-mono font-medium text-[0.9375rem] leading-[1.6] border border-xco-ink px-4 py-2 text-xco-ink hover:bg-xco-ink hover:text-xco-paper transition-colors disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="space-y-8">
      {/* Preview */}
      <div
        className="flex items-center justify-center py-16 px-8"
        style={{
          background: active.bg ?? "transparent",
          border: "1px solid var(--border-default)",
        }}
      >
        <Logo variant={variant} withDescriptor={withDescriptor} height={withDescriptor ? 130 : 96} />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <fieldset className="space-y-3">
          <legend className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink uppercase tracking-widest mb-3">
            Variant
          </legend>
          {logoVariants.map((v) => (
            <label key={v.id} className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="logo-variant"
                checked={variant === v.id}
                onChange={() => setVariant(v.id)}
                className="mt-1.5 accent-xco-ink"
              />
              <span className="space-y-0.5">
                <span className="block font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                  {v.label}
                </span>
                <span className="block font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">
                  {v.usage}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink uppercase tracking-widest mb-3">
            Options
          </legend>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={withDescriptor}
              onChange={(e) => setWithDescriptor(e.target.checked)}
              className="mt-1.5 accent-xco-ink"
            />
            <span className="space-y-0.5">
              <span className="block font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                Descriptor lockup
              </span>
              <span className="block font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">
                Adds the full name in DM Mono. This line is live text, not outlines — see the note below.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={withBackground}
              onChange={(e) => setWithBackground(e.target.checked)}
              className="mt-1.5 accent-xco-ink"
            />
            <span className="space-y-0.5">
              <span className="block font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink">
                Painted background
              </span>
              <span className="block font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted">
                Off by default — logo files should ship transparent.
              </span>
            </span>
          </label>
        </fieldset>
      </div>

      {/* Downloads */}
      <div className="space-y-4 pt-2">
        <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink uppercase tracking-widest">
          Download
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={downloadSvg} className={btn}>
            SVG (vector)
          </button>
          {PNG_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => downloadPng(size)}
              disabled={busy !== null}
              className={btn}
            >
              {busy === `png-${size}` ? "rendering…" : `PNG ${size}px`}
            </button>
          ))}
          <button onClick={copySvg} className={btn}>
            {copied ? "copied ✓" : "Copy SVG code"}
          </button>
        </div>
        {error && (
          <p className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-dusk">
            {error}
          </p>
        )}
        <p className="font-mono font-medium text-[0.75rem] leading-[1.4] text-xco-ink-muted max-w-2xl">
          SVG is the master. The letterforms are geometry, so the file renders identically
          with no fonts installed. PNG is rasterised server-side at the size you pick — use
          it only where SVG is not accepted.
        </p>
      </div>

      {/* Source */}
      <details className="pt-2">
        <summary className="font-mono font-medium text-[0.9375rem] leading-[1.6] text-xco-ink cursor-pointer hover:text-xco-dusk transition-colors">
          View SVG source
        </summary>
        <pre
          className="mt-4 p-4 overflow-x-auto font-mono font-medium text-[0.75rem] leading-[1.5] text-xco-ink-muted"
          style={{ background: "var(--xco-paper-quiet)" }}
        >
          {svg}
        </pre>
      </details>
    </div>
  );
}
