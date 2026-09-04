"use client";

import { useEffect } from "react";

/**
 * Scroll-driven polish for the public home page:
 *  - `[data-reveal]` elements fade/slide in the first time they enter the viewport
 *    (`data-reveal="stagger"` staggers direct children);
 *  - `[data-count]` numbers count up from zero the first time they are seen;
 *  - the header gains `.is-scrolled` once the page moves, and the hero photo
 *    drifts slightly (parallax) on wide screens.
 * Everything is a no-op when the user prefers reduced motion, and content stays
 * visible without JavaScript because the hiding class is only added here.
 */
export function ScrollEffects({ rootSelector = ".home-reference" }: { rootSelector?: string }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(rootSelector);
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];

    // Header state
    const nav = root.querySelector<HTMLElement>(".landing-nav");
    const hero = root.querySelector<HTMLElement>(".home-ref-product");
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        nav?.classList.toggle("is-scrolled", y > 8);
        if (hero && !reduce && window.innerWidth > 960) {
          hero.style.transform = `translate3d(0, ${Math.min(y, 700) * 0.08}px, 0)`;
        } else if (hero) {
          hero.style.transform = "";
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    cleanups.push(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
      if (hero) hero.style.transform = "";
    });

    if (reduce || !("IntersectionObserver" in window)) {
      return () => cleanups.forEach((fn) => fn());
    }

    // Reveal on enter
    root.classList.add("reveal-ready");
    const revealTargets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
    cleanups.push(() => revealObserver.disconnect());

    // Count-up figures ("30+", "3", "7-Day")
    const countTargets = Array.from(root.querySelectorAll<HTMLElement>("[data-count]"));
    const countObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          countObserver.unobserve(el);
          const original = el.dataset.count || el.textContent || "";
          const match = /^(\d+)(.*)$/.exec(original.trim());
          if (!match) continue;
          const target = Number(match[1]);
          const suffix = match[2];
          const duration = 900;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = `${Math.round(target * eased)}${suffix}`;
            if (t < 1) window.requestAnimationFrame(tick);
            else el.textContent = original;
          };
          window.requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );
    countTargets.forEach((el) => {
      if (!el.dataset.count) el.dataset.count = el.textContent || "";
      countObserver.observe(el);
    });
    cleanups.push(() => countObserver.disconnect());

    return () => {
      cleanups.forEach((fn) => fn());
      root.classList.remove("reveal-ready");
    };
  }, [rootSelector]);

  return null;
}
