import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RoastMyPage — Brutal AI Landing Page Critique",
  description: "Get a brutally honest, AI-powered critique of your landing page. No sugarcoating.",
  openGraph: {
    title: "RoastMyPage — Brutal AI Landing Page Critique",
    description: "Get a brutally honest, AI-powered critique of your landing page.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-black text-white">{children}</body>
    </html>
  );
}
