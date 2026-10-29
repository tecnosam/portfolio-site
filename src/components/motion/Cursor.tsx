"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import useMediaQuery from "@/components/motion/useMediaQuery";

type Mode = "idle" | "hover" | "label";

// rgba rather than oklch so Motion can interpolate between them.
const backgrounds: Record<Mode, string> = {
  idle: "rgba(230, 231, 236, 0)",
  hover: "rgba(230, 231, 236, 0.12)",
  label: "rgba(110, 55, 210, 1)",
};

// A trailing ring for mouse users. It sits on top of the native cursor rather than replacing it,
// grows over links and buttons, and shows a label over anything marked data-cursor="...".
export default function Cursor() {
  const enabled = useMediaQuery("(pointer: fine) and (prefers-reduced-motion: no-preference)");
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [label, setLabel] = useState<string | null>(null);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 420, damping: 36, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 420, damping: 36, mass: 0.5 });

  useEffect(() => {
    if (!enabled) return;

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const over = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest("a, button, [data-cursor], input, textarea, select, label");
      const text = target?.getAttribute("data-cursor") ?? null;
      setLabel(text);
      setMode(text ? "label" : target ? "hover" : "idle");
    };
    const leave = () => setVisible(false);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = mode === "label" ? 92 : mode === "hover" ? 46 : 26;

  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-80"
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center ${
          mode === "label" ? "text-primary-content" : "border border-base-content/50 mix-blend-difference"
        }`}
        animate={{ width: size, height: size, backgroundColor: backgrounds[mode] }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        <AnimatePresence>
          {label && (
            <motion.span
              key={label}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="font-mono text-[10px] uppercase tracking-[0.14em]"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
