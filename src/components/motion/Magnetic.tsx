"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Leans its child toward the pointer while the pointer is over it, then springs back.
export default function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.6 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.6 });

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={`inline-block ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}
