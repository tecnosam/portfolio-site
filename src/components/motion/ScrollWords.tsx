"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

// Words light up one by one as the paragraph scrolls through the viewport.
// Wrap a phrase in [[double brackets]] to set it in the accent colour.
export default function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });

  const words: { word: string; accent: boolean }[] = [];
  for (const m of text.matchAll(/\[\[(.+?)\]\]|(\S+)/g)) {
    if (m[1]) m[1].split(" ").forEach((word) => words.push({ word, accent: true }));
    else words.push({ word: m[2], accent: false });
  }

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} accent={w.accent}>
          {w.word}
        </Word>
      ))}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
  accent,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  accent: boolean;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <>
      <motion.span style={{ opacity }} className={accent ? "text-primary" : undefined}>
        {children}
      </motion.span>{" "}
    </>
  );
}
