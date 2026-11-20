import type { Metadata } from "next";
import { HolidayCards } from "./HolidayCards";

// Outside the style guide's layouts, so nothing but the cards reaches the print dialog.
export const metadata: Metadata = {
  title: "Holiday cards — xCO",
  robots: { index: false, follow: false },
};

export default function HolidayCardsPage() {
  return <HolidayCards />;
}
