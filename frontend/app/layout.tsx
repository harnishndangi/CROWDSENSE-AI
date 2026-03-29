import type { Metadata } from "next";
import { Bebas_Neue, Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import GoogleTranslate from "./components/GoogleTranslate";

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const barlow = Barlow({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "CrowdSense Mumbai | Signal-Aware Urban Intelligence",
  description: "Predict the crowd. Beat the rush. Mumbai's first agentic network for smart urban navigation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${barlow.variable} ${barlowCondensed.variable} ${mono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {children}
        <GoogleTranslate />
      </body>
    </html>
  );
}
