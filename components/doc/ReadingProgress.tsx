"use client";

import { useEffect, useRef } from "react";

// Thin dusk bar showing scroll depth. Written straight to the DOM via ref
// rather than through state — a scroll handler that calls setState re-renders
// on every frame of every scroll.
export function ReadingProgress() {
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const el = bar.current;
      if (!el) return;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      el.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="doc-progress" aria-hidden="true">
      <span ref={bar} />
    </div>
  );
}
