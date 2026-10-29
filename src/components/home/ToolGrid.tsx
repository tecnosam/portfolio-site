"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { aiTools } from "@/lib/site-nav";
import { easeOutExpo } from "@/components/motion/Reveal";

const track = (e: React.PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
};

export default function ToolGrid() {
  return (
    <div className="grid gap-px overflow-hidden rounded-3xl border hairline bg-base-content/10 sm:grid-cols-2">
      {aiTools.map((tool, i) => (
        <motion.div
          key={tool.href}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 1.2, ease: easeOutExpo, delay: i * 0.08 }}
          className="bg-base-100"
        >
          <Link
            href={tool.href}
            onPointerMove={track}
            data-cursor="Try"
            className="spotlight group flex h-full min-h-[17rem] flex-col p-7 md:p-10"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-base-content/30">0{i + 1}</span>
              {tool.tag && <span className="eyebrow text-primary/80">{tool.tag}</span>}
            </div>
            <h3 className="mt-auto pt-10 font-display text-3xl md:text-4xl font-light tracking-tight transition-colors duration-500 group-hover:text-primary">
              {tool.title}
            </h3>
            <div className="mt-3 flex items-end justify-between gap-6">
              <p className="max-w-sm text-sm leading-relaxed text-base-content/50">{tool.desc}</p>
              <ArrowUpRight
                size={22}
                className="shrink-0 text-base-content/30 transition-all duration-700 ease-out-expo group-hover:rotate-45 group-hover:text-primary"
              />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
