"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useLenis } from "lenis/react";
import { ArrowUpRight, X } from "lucide-react";
import { navLinks, aiTools } from "@/lib/site-nav";
import { profile } from "@/lib/data";
import { easeOutExpo } from "@/components/motion/Reveal";

export default function Navbar() {
  const pathname = usePathname();
  const lenis = useLenis();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > 160 && y > prev);
    setScrolled(y > 24);
  });

  // Close any overlay when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setToolsOpen(false);
    setMenuOpen(false);
  }

  const locked = toolsOpen || menuOpen;
  useEffect(() => {
    if (locked) lenis?.stop(); else lenis?.start();
    document.body.style.overflow = locked ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [locked, lenis]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setToolsOpen(false); setMenuOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <motion.header
        style={{ viewTransitionName: "site-header" }}
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: hidden && !locked ? "-110%" : "0%" }}
        transition={{ duration: 0.6, ease: easeOutExpo }}
      >
        <div
          className={`absolute inset-0 -z-10 transition-opacity duration-500 bg-gradient-to-b from-base-100/90 to-transparent ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="flex h-16 items-center justify-between px-5 md:px-8">
          <Link href="/" className="group flex items-baseline gap-3">
            <span className="font-display text-2xl leading-none tracking-tight">
              SA<span className="text-primary">.</span>
            </span>
            <span className="eyebrow hidden sm:inline transition-colors group-hover:text-base-content/70">
              Samuel Abolo
            </span>
          </Link>

          <nav className="hidden lg:block">
            <ul className="flex items-center gap-1 rounded-full border hairline bg-base-200/50 p-1 backdrop-blur-xl">
              {navLinks.map((link) => (
                <li key={link.href} className="relative">
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-base-content/10"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Link
                    href={link.href}
                    className={`relative block rounded-full px-4 py-1.5 text-sm transition-colors ${
                      isActive(link.href) ? "text-base-content" : "text-base-content/55 hover:text-base-content"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setToolsOpen(true)}
              className="group hidden sm:flex items-center gap-2 rounded-full border hairline bg-base-200/50 px-4 py-2 text-sm backdrop-blur-xl transition-colors hover:border-primary/50"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative size-1.5 rounded-full bg-primary" />
              </span>
              AI tools
            </button>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="lg:hidden rounded-full border hairline bg-base-200/50 px-4 py-2 text-sm backdrop-blur-xl"
              aria-expanded={menuOpen}
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-base-100 px-6 pb-8 pt-24 lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: easeOutExpo }}
            data-lenis-prevent
          >
            <ul className="space-y-1">
              {navLinks.map((link, i) => (
                <li key={link.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.15 + i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-baseline gap-4 font-display text-5xl leading-tight ${
                        isActive(link.href) ? "text-primary" : ""
                      }`}
                    >
                      <span className="font-mono text-xs text-base-content/35">0{i + 1}</span>
                      {link.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
            <motion.div
              className="mt-auto space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={() => { setMenuOpen(false); setToolsOpen(true); }}
                className="btn btn-primary w-full"
              >
                Explore the AI tools
              </button>
              <div className="flex justify-between eyebrow">
                <a href={profile.socials.github} target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>
                <a href={`mailto:${profile.email}`}>Email</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI tools */}
      <AnimatePresence>
        {toolsOpen && (
          <motion.div
            className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-base-100/70 p-3 sm:p-6 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={() => setToolsOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="AI tools"
              className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl border hairline bg-base-200 shadow-2xl"
              initial={{ y: 60, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent
            >
              <div className="flex items-start justify-between p-6 sm:p-8 pb-2">
                <div>
                  <p className="eyebrow mb-3">Interactive</p>
                  <h2 className="text-3xl sm:text-4xl">Ask the site about me</h2>
                  <p className="mt-2 text-sm text-base-content/50 max-w-sm">
                    Four AI tools that read my full background and answer the question you actually have.
                  </p>
                </div>
                <button
                  onClick={() => setToolsOpen(false)}
                  className="btn btn-ghost btn-circle btn-sm text-base-content/50"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <ul className="p-3 sm:p-4">
                {aiTools.map((tool, i) => (
                  <motion.li
                    key={tool.href}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.12 + i * 0.05 }}
                  >
                    <Link
                      href={tool.href}
                      className="group flex items-start gap-5 rounded-2xl p-4 sm:p-5 transition-colors hover:bg-base-content/5"
                    >
                      <span className="font-mono text-xs text-base-content/30 pt-1.5">0{i + 1}</span>
                      <span className="flex-1">
                        <span className="flex items-center gap-3">
                          <span className="font-display text-2xl transition-colors group-hover:text-primary">{tool.title}</span>
                          {tool.tag && <span className="eyebrow text-[0.6rem] text-primary/80">{tool.tag}</span>}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-base-content/50">{tool.desc}</span>
                      </span>
                      <ArrowUpRight
                        size={20}
                        className="mt-1.5 text-base-content/30 transition-all duration-500 group-hover:rotate-45 group-hover:text-primary"
                      />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
