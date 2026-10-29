"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LineReveal, easeOutExpo } from "@/components/motion/Reveal";
import Magnetic from "@/components/motion/Magnetic";
import LagosClock from "@/components/motion/LagosClock";
import DownloadResumeLink from "@/components/ui/DownloadResumeLink";
import { profile } from "@/lib/data";

const SignalField = dynamic(() => import("@/components/three/SignalField"), { ssr: false });

const fadeIn = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.1, ease: easeOutExpo, delay },
});

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const filter = useTransform(scrollYProgress, [0, 0.75], ["blur(0px)", "blur(10px)"]);

  return (
    <section ref={ref} className="relative -mt-16 h-svh min-h-[680px] overflow-hidden">
      <SignalField className="absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-base-100 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-base-100 via-base-100/70 to-transparent" />

      <motion.div
        style={{ y, opacity, filter }}
        className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-5 pb-8 pt-28 md:px-8"
      >
        <motion.div {...fadeIn(0.9)} className="flex items-start justify-between gap-6 eyebrow">
          <span className="leading-relaxed">
            Machine learning · AI systems<br />Backends · MLOps
          </span>
          <span className="text-right leading-relaxed">
            Now · Agentic AI at Boostr<br />
            Lagos <LagosClock /> WAT
          </span>
        </motion.div>

        <div className="mt-auto">
          <h1
            className="font-display font-medium leading-[0.86] tracking-[-0.065em] text-[clamp(4.5rem,15.5vw,15.5rem)]"
          >
            <LineReveal
              delay={0.15}
              stagger={0.12}
              lines={[
                "Samuel",
                <span key="abolo" className="block pl-[0.9em] text-base-content/35">
                  Abolo<span className="text-primary">.</span>
                </span>,
              ]}
            />
          </h1>

          <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
            <motion.p {...fadeIn(0.7)} className="md:col-span-5 text-lg leading-relaxed text-base-content/65">
              {profile.title}. {profile.tagline}
            </motion.p>

            <motion.div {...fadeIn(0.85)} className="md:col-span-6 md:col-start-7 flex flex-wrap items-center gap-3 md:justify-end">
              <Magnetic>
                <Link href="/contact" className="btn btn-primary btn-lg gap-2 px-7 font-medium">
                  Get in touch <ArrowRight size={17} />
                </Link>
              </Magnetic>
              <Magnetic>
                <DownloadResumeLink source="hero" />
              </Magnetic>
              <Link
                href="/ask-sam"
                className="ml-1 text-sm text-base-content/50 underline decoration-base-content/20 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
              >
                or ask the AI about me
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div {...fadeIn(1.2)} className="mt-12 flex items-center justify-between eyebrow">
          <span className="flex items-center gap-3">
            <span className="relative block h-8 w-px overflow-hidden bg-base-content/10">
              <span className="animate-scroll-cue absolute inset-0 bg-base-content/70" />
            </span>
            Scroll
          </span>
          <span>5+ years in production</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
