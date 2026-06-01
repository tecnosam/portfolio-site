"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Menu, FileSearch, MessageSquare, Zap, HelpCircle, X, ArrowRight } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/open-source", label: "Open Source" },
  { href: "/communities", label: "Communities" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

const aiFeatures = [
  {
    href: "/jd-analyzer",
    icon: <FileSearch size={26} />,
    title: "JD Analyzer",
    desc: "Paste or upload a job description. Get a 1–100 fit score, strengths, gap analysis, and a resume tailored to that exact role.",
    color: "text-primary",
    bg: "bg-primary/8 hover:bg-primary/12 border-primary/15",
    badge: "Most Popular",
  },
  {
    href: "/ask-sam",
    icon: <MessageSquare size={26} />,
    title: "Ask About Sam",
    desc: "Chat with an AI that knows my full background - skills, experience, projects, and what I'm looking for next.",
    color: "text-info",
    bg: "bg-info/8 hover:bg-info/12 border-info/15",
    badge: null,
  },
  {
    href: "/refer-me",
    icon: <Zap size={26} />,
    title: "Refer Me",
    desc: "Get an AI-customized referral kit - enter a role or upload a JD to get a tailored pitch and key strengths.",
    color: "text-warning",
    bg: "bg-warning/8 hover:bg-warning/12 border-warning/15",
    badge: "AI Customized",
  },
  {
    href: "/how-can-i-help",
    icon: <HelpCircle size={26} />,
    title: "How Can I Help?",
    desc: "Share your business context and tech stack. Get a specific breakdown of how Sam can add value to your team.",
    color: "text-success",
    bg: "bg-success/8 hover:bg-success/12 border-success/15",
    badge: null,
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close modal on route change
  useEffect(() => { setModalOpen(false); setMobileOpen(false); }, [pathname]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  return (
    <>
      <div className={`navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8 h-16 ${
        scrolled ? "bg-base-100/95 backdrop-blur-md shadow-sm border-b border-base-300" : "bg-base-100/80 backdrop-blur-sm"
      }`}>
        {/* Logo */}
        <div className="navbar-start">
          <Link href="/" className="text-base-content font-bold text-lg tracking-tight flex items-center gap-0.5">
            SA<span className="text-primary">.</span>
          </Link>
        </div>

        {/* Desktop center nav */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal menu-sm gap-0.5 p-0">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-lg text-sm font-medium ${
                    pathname === link.href
                      ? "bg-base-200 text-base-content"
                      : "text-base-content/60 hover:text-base-content hover:bg-base-200"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop right - AI button */}
        <div className="navbar-end hidden lg:flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="btn btn-sm btn-primary gap-1.5"
          >
            <Sparkles size={13} />
            AI Features
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="navbar-end lg:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn btn-ghost btn-sm btn-square"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-base-100 border-b border-base-300 shadow-lg lg:hidden">
          <ul className="menu menu-sm p-4 gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm ${pathname === link.href ? "bg-base-200 font-medium" : "text-base-content/70"}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              <button
                onClick={() => { setMobileOpen(false); setModalOpen(true); }}
                className="btn btn-primary btn-sm gap-2 justify-start"
              >
                <Sparkles size={13} /> AI Features
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* AI Features Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-base-100 rounded-2xl shadow-2xl border border-base-300 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4 border-b border-base-200">
              <div>
                <h2 className="text-2xl font-black text-base-content">AI Features</h2>
                <p className="text-base-content/50 text-sm mt-1">
                  Interact with my profile in ways that actually matter to you.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-base-content mt-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Feature cards */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {aiFeatures.map((feat) => (
                <Link
                  key={feat.href}
                  href={feat.href}
                  className={`group card border ${feat.bg} transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <div className="card-body p-5 gap-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2.5 rounded-xl bg-base-100 ${feat.color}`}>
                        {feat.icon}
                      </div>
                      {feat.badge && (
                        <span className="badge badge-ghost border border-base-300 badge-xs text-base-content/40">
                          {feat.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-black text-base-content text-base mb-1">{feat.title}</p>
                      <p className="text-base-content/55 text-sm leading-relaxed">{feat.desc}</p>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${feat.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      Open <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
