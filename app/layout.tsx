import type { Metadata } from "next";
import { Crimson_Pro, DM_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-dm-mono",
  display: "swap",
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-crimson-pro",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "xCO — Expanding Civilizational Optionality",
  description:
    "Living style guide and asset-generation system for Expanding Civilizational Optionality, a Dark Matter Labs project.",
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
        dmMono.variable,
        crimsonPro.variable,
        inter.variable,
      )}
    >
      {/* FOUC prevention — reads localStorage before first paint */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('xco-theme');if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.dataset.theme='dark'}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
