import type { Metadata } from "next";
import { XDemo } from "./XDemo";

// A full-screen mock website, outside the style-guide layout, so the x docks
// in a 40 px logo the way it would on the xCO website. Rules: /logo/x.
export const metadata: Metadata = {
  title: "The x, live — xCO",
  robots: { index: false, follow: false },
};

export default function XDemoPage() {
  return <XDemo />;
}
