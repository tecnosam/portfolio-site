"use client";

import { useRef } from "react";
import {
  motion, useAnimationFrame, useMotionValue, useReducedMotion,
  useScroll, useSpring, useTransform, useVelocity,
} from "framer-motion";

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

// A marquee that drifts on its own and speeds up, or reverses, with the speed and direction of scrolling.
export default function VelocityMarquee({
  items,
  baseVelocity = -2,
  className,
}: {
  items: string[];
  baseVelocity?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [0, 1000], [0, 4], { clamp: false });
  // Four copies of the row, so shifting by a quarter lands exactly where it started.
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    let moveBy = direction.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    moveBy += direction.current * moveBy * f;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden whitespace-nowrap select-none">
      <motion.div className={`flex w-max ${className ?? ""}`} style={{ x }}>
        {[0, 1, 2, 3].map((copy) => (
          <span key={copy} aria-hidden={copy > 0} className="flex shrink-0">
            {items.map((item) => (
              <span key={item} className="flex items-center">
                <span className="px-[0.35em]">{item}</span>
                <span className="text-primary text-[0.45em] px-[0.35em]">✦</span>
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
