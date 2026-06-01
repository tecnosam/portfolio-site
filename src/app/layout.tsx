import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Samuel Abolo - Agentic AI Engineer",
  description:
    "Senior AI Engineer with 5+ years shipping production LLM systems. Expert in multi-agent orchestration, RAG pipelines, and distributed backend systems.",
  keywords: ["AI Engineer", "Backend Engineer", "LLM", "RAG", "Agentic AI", "Samuel Abolo"],
  authors: [{ name: "Samuel Abolo" }],
  openGraph: {
    title: "Samuel Abolo - Agentic AI Engineer",
    description: "Senior AI Engineer building production LLM systems and AI agent backends.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="sam" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-base-100 antialiased">
        <Navbar />
        <main className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
