import type { Metadata } from "next";
import { XSketches } from "./XSketches";

// spike: throwaway sketches of the x as a page character. Not part of the
// system and not linked from any nav; delete or promote once a direction is chosen.
export const metadata: Metadata = {
  title: "x sketches — xCO",
  robots: { index: false, follow: false },
};

export default function XSketchesPage() {
  return <XSketches />;
}
