import type { Metadata } from "next";
import "./globals.css";
import { SkipLink } from "@/components/doc/SkipLink";

// Fonts are self-hosted with @font-face in globals.css (Untitled, DM Mono,
// Crimson Pro), not next/font: see the note there on why.

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
    // suppressHydrationWarning: the theme script below adds .dark before React hydrates.
    <html lang="en" suppressHydrationWarning>
      {/* FOUC prevention — reads localStorage before first paint */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('xco-theme');if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.dataset.theme='dark'}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased">
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
