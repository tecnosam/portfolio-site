"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import { easeOutExpo } from "@/components/motion/Reveal";

export type Work = {
  name: string;
  description: string;
  tags: string[];
  stars: number;
  href: string;
  demoHref: string | null;
};

// Large editorial rows. The whole row opens the project (its site, or the repo when it has none);
// the source link sits above that stretched link.
export default function WorkList({ items }: { items: Work[] }) {
  return (
    <ul className="border-b hairline">
      {items.map((p, i) => (
        <motion.li
          key={p.name}
          className="group relative isolate border-t hairline"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 1.1, ease: easeOutExpo, delay: i * 0.08 }}
        >
          <span
            aria-hidden
            className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-base-content/[0.03] transition-transform duration-700 ease-out-expo group-hover:scale-y-100"
          />
          <div className="grid gap-x-6 gap-y-4 py-9 md:grid-cols-12 md:items-center md:py-12">
            <span className="font-mono text-xs text-base-content/30 md:col-span-1">0{i + 1}</span>

            <a
              href={p.demoHref ?? p.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor={p.demoHref ? "Visit" : "Code"}
              className="md:col-span-5 after:absolute after:inset-0"
            >
              <span className="block font-display text-[clamp(2.75rem,6.5vw,5.75rem)] font-light leading-[0.95] tracking-[-0.03em] transition-[transform,color] duration-700 ease-out-expo group-hover:translate-x-3 group-hover:text-primary">
                {p.name}
              </span>
            </a>

            <div className="md:col-span-5">
              <p className="text-base leading-relaxed text-base-content/55 max-w-md">{p.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.12em] text-base-content/35">
                {p.tags.map((t) => <span key={t}>{t}</span>)}
                {p.stars > 0 && (
                  <span className="flex items-center gap-1 text-base-content/55">
                    <Star size={11} className="fill-current" /> {p.stars}
                  </span>
                )}
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-4 md:col-span-1 md:justify-end">
              {p.demoHref && (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="eyebrow transition-colors hover:text-primary md:hidden"
                >
                  Source
                </a>
              )}
              <span className="flex size-11 items-center justify-center rounded-full border hairline transition-all duration-700 ease-out-expo group-hover:rotate-45 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-content">
                <ArrowUpRight size={18} />
              </span>
            </div>
          </div>
          {p.demoHref && (
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow absolute bottom-4 right-0 z-10 hidden transition-colors hover:text-primary md:block"
            >
              Source on GitHub ↗
            </a>
          )}
        </motion.li>
      ))}
    </ul>
  );
}
