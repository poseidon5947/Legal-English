"use client";

import { useEffect } from "react";

/** Reveal content once; keep the hero carousel as the only continuous motion. */
export function ScrollEffects({ rootSelector = ".home-reference" }: { rootSelector?: string }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(rootSelector);
    if (!root) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nav = root.querySelector<HTMLElement>(".landing-nav");
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    let observer: IntersectionObserver | undefined;
    const updateMotion = () => {
      observer?.disconnect();
      root.classList.remove("reveal-ready");
      if (motion.matches || !("IntersectionObserver" in window)) return;
      root.classList.add("reveal-ready");
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in-view");
          observer?.unobserve(entry.target);
        }
      }, { threshold: 0.05 });
      targets.forEach(target => observer?.observe(target));
    };
    // Keyboard navigation must never land on a visually hidden reveal target.
    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      event.target.closest("[data-reveal]")?.classList.add("in-view");
    };
    const onScroll = () => nav?.classList.toggle("is-scrolled", window.scrollY > 8);
    updateMotion();
    onScroll();
    motion.addEventListener("change", updateMotion);
    root.addEventListener("focusin", onFocus);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer?.disconnect();
      root.classList.remove("reveal-ready");
      motion.removeEventListener("change", updateMotion);
      root.removeEventListener("focusin", onFocus);
      window.removeEventListener("scroll", onScroll);
    };
  }, [rootSelector]);
  return null;
}
