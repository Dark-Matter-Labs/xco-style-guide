"use client";

import { useEffect, useState } from "react";
import { globeField } from "@/lib/event-series/globe-field";
import { loadFonts, loadImage, resolveFonts } from "./render/fonts";
import type { Assets } from "./render/types";

/** Fonts and the globe photograph, loaded once. `ready` flips when the fonts
 *  are in; a failed photo leaves the halftone drawing alone, with a message. */
export function useCardAssets(instrumentFamily: string) {
  const [assets, setAssets] = useState<Assets | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    const fonts = resolveFonts(instrumentFamily);
    (async () => {
      await loadFonts(fonts);
      let photo: HTMLImageElement | null = null;
      try {
        photo = await loadImage(globeField.photo.src);
      } catch {
        if (live) setError("The globe photograph did not load — cards show the halftone only.");
      }
      if (live) setAssets({ fonts, photo });
    })();
    return () => {
      live = false;
    };
  }, [instrumentFamily]);

  return { assets, error };
}
