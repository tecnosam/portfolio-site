"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";

// Lenis keeps its own idea of the scroll position, so a route change has to reset it too.
function ResetOnNavigate() {
  const lenis = useLenis();
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    lenis?.scrollTo(0, { immediate: true, force: true });
  }, [pathname, lenis]);

  return null;
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <ReactLenis root options={{ lerp: 0.085, smoothWheel: !reduce, wheelMultiplier: 0.95 }}>
      <ResetOnNavigate />
      {children}
    </ReactLenis>
  );
}
