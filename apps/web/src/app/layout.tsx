import type { Metadata } from "next";
import "./globals.css";
import { Roboto } from "next/font/google";

import React from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";

const roboto = Roboto({
  subsets: ["latin"],
  preload: true,
  display: "swap",
});
export const metadata: Metadata = {
  title: "Leganize",
  description: "AI Meeting summarize platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <SessionProvider>
          <NuqsAdapter>
            <Navbar />
            <main className="container py-18 min-h-screen mx-auto px-4">
              {children}
            </main>
            <MobileNav />
          </NuqsAdapter>
        </SessionProvider>
      </body>
    </html>
  );
}
