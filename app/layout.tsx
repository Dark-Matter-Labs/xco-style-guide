import type { Metadata } from "next";
import { Crimson_Pro, Inter, DM_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-crimson",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "xCO — Expanding Civilisational Optionality",
  description:
    "Living style guide and asset-generation system for Expanding Civilisational Optionality, a Dark Matter Labs project.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        crimsonPro.variable,
        inter.variable,
        dmMono.variable,
      )}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
