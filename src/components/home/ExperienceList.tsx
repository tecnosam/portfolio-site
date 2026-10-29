"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { easeOutExpo } from "@/components/motion/Reveal";

type Role = {
  company: string;
  role: string;
  period: string;
  location: string;
  highlights: string[];
  current: boolean;
};

// An accordion of roles; the current one starts open.
export default function ExperienceList({ roles }: { roles: Role[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="border-b hairline">
      {roles.map((r, i) => {
        const isOpen = open === i;
        return (
          <motion.li
            key={r.company}
            className="border-t hairline"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 1, ease: easeOutExpo, delay: i * 0.06 }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="group grid w-full grid-cols-12 items-baseline gap-x-6 gap-y-1 py-7 text-left md:py-8"
            >
              <span className="col-span-10 md:col-span-3 order-2 md:order-1 font-mono text-xs uppercase tracking-[0.12em] text-base-content/40">
                {r.period}
              </span>
              <span className="col-span-10 md:col-span-5 order-1 md:order-2 flex items-center gap-3 font-display text-3xl md:text-4xl leading-tight transition-colors group-hover:text-primary">
                {r.company}
                {r.current && (
                  <span className="relative flex size-2" title="Current role">
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-60" />
                    <span className="relative size-2 rounded-full bg-primary" />
                  </span>
                )}
              </span>
              <span className="col-span-10 md:col-span-3 order-3 text-sm text-base-content/55">{r.role}</span>
              <span className="col-span-2 md:col-span-1 order-1 md:order-4 row-span-3 md:row-span-1 justify-self-end self-start md:self-auto">
                <span className={`flex size-9 items-center justify-center rounded-full border hairline transition-all duration-500 ease-out-expo ${
                  isOpen ? "rotate-45 border-primary text-primary" : "group-hover:border-base-content/40"
                }`}>
                  <Plus size={16} />
                </span>
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.7, ease: easeOutExpo }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-12 gap-x-6 pb-10">
                    <p className="col-span-12 md:col-span-3 eyebrow mb-4 md:mb-0">{r.location}</p>
                    <ul className="col-span-12 md:col-span-8 space-y-3">
                      {r.highlights.map((h) => (
                        <li key={h} className="flex gap-4 text-base leading-relaxed text-base-content/65">
                          <span className="mt-[0.7em] h-px w-4 shrink-0 bg-primary" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.li>
        );
      })}
    </ul>
  );
}
