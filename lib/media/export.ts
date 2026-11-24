// The instruments' file exports, in one place: SVG straight from the page, PNG
// through the server rasteriser (app/api/export/png). Every failure throws an
// Error whose message can be shown as it is; generators show it with useExport
// (components/generator-controls), so a failed export never passes in silence.

export const SVG_TYPE = "image/svg+xml;charset=utf-8";

/** An SVG element, or SVG markup already built. Null while a hidden export copy has not mounted. */
export type SvgSource = SVGSVGElement | string | null;

export function svgToString(el: SVGSVGElement): string {
  return '<?xml version="1.0" standalone="no"?>\n' + new XMLSerializer().serializeToString(el);
}

export function svgText(svg: SvgSource): string {
  if (!svg) throw new Error("Nothing to export yet. Wait a moment and try again.");
  return typeof svg === "string" ? svg : svgToString(svg);
}

export function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  // Revoking at once can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportSVG(svg: SvgSource, name: string): void {
  download(new Blob([svgText(svg)], { type: SVG_TYPE }), name);
}

const AFTER = "Try again, or download the SVG.";

/** Rasterises SVG markup to a PNG blob on the server. `send` is fetch, swappable for tests. */
export async function rasterise(svg: string, width: number, height: number, send: typeof fetch = fetch): Promise<Blob> {
  let res: Response;
  try {
    res = await send("/api/export/png", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ svg, width, height }),
    });
  } catch {
    throw new Error(`PNG export failed: the server could not be reached. ${AFTER}`);
  }
  if (!res.ok) {
    // The route answers a failure with { error }; anything else (a proxy's page) is not worth showing.
    const said = await res
      .json()
      .then((b: unknown) => (b && typeof (b as { error?: unknown }).error === "string" ? (b as { error: string }).error : ""))
      .catch(() => "");
    throw new Error(`PNG export failed (${res.status}${said ? `: ${said.slice(0, 120)}` : ""}). ${AFTER}`);
  }
  const blob = await res.blob();
  if (!blob.size) throw new Error(`PNG export failed: the server sent an empty file. ${AFTER}`);
  return blob;
}

export async function exportPNG(svg: SvgSource, width: number, height: number, name: string): Promise<void> {
  download(await rasterise(svgText(svg), width, height), name);
}

/** A canvas as a PNG blob; rejects with a message fit to show when the browser cannot encode it. */
export function canvasPNG(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG encoding failed. Try again, or use another browser."))), "image/png"),
  );
}
