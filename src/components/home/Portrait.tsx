"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { easeOutExpo } from "@/components/motion/Reveal";

// The headshot wipes open from the bottom on first view, then drifts against the scroll.
export default function Portrait() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <motion.div
      ref={ref}
      className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-base-200"
      initial={{ clipPath: "inset(100% 0 0 0 round 1rem)" }}
      whileInView={{ clipPath: "inset(0% 0 0 0 round 1rem)" }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: 1.4, ease: easeOutExpo }}
      data-cursor="Hi"
    >
      <motion.div style={{ y }} className="absolute -inset-y-[10%] inset-x-0">
        <Image
          src="/sam-pictures/headshot.png"
          alt="Samuel Abolo"
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover grayscale-[0.85] contrast-[1.05] transition-[filter] duration-1000 group-hover:grayscale-0"
        />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-base-100/60 via-transparent to-transparent" />
    </motion.div>
  );
}
