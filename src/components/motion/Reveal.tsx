"use client";

import { motion } from "framer-motion";

export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

// Fades and lifts its children the first time they scroll into view.
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1.1, ease: easeOutExpo, delay }}
    >
      {children}
    </motion.div>
  );
}

// Slides each line up from behind a mask, one after another. Plays on mount, or on first view
// when `inView` is set.
export function LineReveal({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  inView = false,
}: {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  inView?: boolean;
}) {
  // The wrapper is what gets watched: the lines start clipped by their masks, so they never
  // intersect the viewport on their own.
  return (
    <motion.span
      className={className}
      initial="hidden"
      {...(inView
        ? { whileInView: "shown", viewport: { once: true, margin: "0px 0px -10% 0px" } }
        : { animate: "shown" })}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] mb-[-0.08em]">
          <motion.span
            className={`block origin-top-left ${lineClassName ?? ""}`}
            variants={{ hidden: { y: "110%", rotate: 3 }, shown: { y: "0%", rotate: 0 } }}
            transition={{ duration: 1.25, ease: easeOutExpo, delay: delay + i * stagger }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
