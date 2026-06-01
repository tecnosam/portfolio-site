import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Samuel Abolo - Senior Software Engineer",
  description:
    "Senior Software Engineer with 5+ years shipping production systems. Expert in multi-agent orchestration, RAG pipelines, and distributed backend systems.",
  keywords: [ "Abolo Samuel", "Samuel Abolo", "Samuel Ikechukwu Abolo", "Samuel Abolo Portfolio", "AI Engineer", "Backend Engineer", "Machine Learning", "MLOps"],
  authors: [{ name: "Samuel Abolo" }],
  openGraph: {
    title: "Samuel Abolo: Senior Software Engineer",
    description: "Senior Software Engineer building production LLM systems and distributed backends.",
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
