import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import React from "react";

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cadence',
  description: 'A disciplined, high-performance daily habit and streak tracker.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="dark overflow-y-scroll"
    >
      <body
        className={`${jakarta.variable} ${jetbrains.variable} font-sans bg-green-500 text-slate-100 min-h-screen antialiased selection:bg-emerald-500/30 selection:text-emerald-300`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
