import type { Metadata } from "next";
import { DM_Sans, Fraunces, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SiteNav } from "@/components/site-nav";
import { PapelPicado } from "@/components/papel-picado";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lola's Archive",
  description: "A local-first family oral-history ofrenda.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", fraunces.variable, dmSans.variable, geistMono.variable)}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <PapelPicado />
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
