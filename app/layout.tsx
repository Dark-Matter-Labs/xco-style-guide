import type { Metadata } from "next";
import { DM_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

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
        dmMono.variable,
      )}
    >
      {/* FOUC prevention — reads localStorage before first paint */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('xco-theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
