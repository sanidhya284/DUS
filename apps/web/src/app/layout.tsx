import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "./providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DUS — Distributed URL Shortener",
  description:
    "A blazing-fast, plan-aware URL shortener with real-time analytics. Shorten, track, and manage your links.",
  keywords: ["url shortener", "link shortener", "analytics", "link management"],
  openGraph: {
    title: "DUS — Distributed URL Shortener",
    description: "Shorten URLs. Track every click. Own your data.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="grain">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
