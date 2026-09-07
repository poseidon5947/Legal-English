"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Photo } from "@/components/photo";

export function WorkflowPhoto({ tag, caption, locale }: { tag: string; caption: string; locale: "en" | "es" }) {
  const figure = useRef<HTMLElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const canTilt = useRef(false);

  function resetTilt() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    surface.current?.style.removeProperty("--photo-rx");
    surface.current?.style.removeProperty("--photo-ry");
    surface.current?.style.removeProperty("--photo-shadow-x");
  }

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 961px)");
    const preferences = () => {
      setReducedMotion(motion.matches);
      canTilt.current = !motion.matches && pointer.matches;
      if (!canTilt.current) resetTilt();
    };
    const visibility = () => {
      setPageVisible(!document.hidden);
      if (document.hidden) resetTilt();
    };
    preferences();
    visibility();
    motion.addEventListener("change", preferences);
    pointer.addEventListener("change", preferences);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (!entry.isIntersecting) resetTilt();
    }, { threshold: .15 });
    if (figure.current) observer.observe(figure.current);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", preferences);
      pointer.removeEventListener("change", preferences);
      document.removeEventListener("visibilitychange", visibility);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  function move(event: PointerEvent<HTMLElement>) {
    if (!canTilt.current || paused || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      surface.current?.style.setProperty("--photo-rx", `${-y * 2.2}deg`);
      surface.current?.style.setProperty("--photo-ry", `${x * 2.8}deg`);
      surface.current?.style.setProperty("--photo-shadow-x", `${-x * 7}px`);
      frame.current = null;
    });
  }

  return (
    <figure className="home-ref-workflow-photo workflow-photo-depth" ref={figure} data-reveal="left" data-running={visible && pageVisible && !paused && !reducedMotion} onPointerMove={move} onPointerLeave={resetTilt} onPointerCancel={resetTilt}>
      <div className="workflow-photo-backplate" aria-hidden="true" />
      <div className="workflow-photo-surface" ref={surface}>
        <Photo src="/home-assets/photos/workflow-study.jpg" size="card" />
        <div className="workflow-photo-vignette" aria-hidden="true" />
        <svg className="workflow-photo-edge" aria-hidden="true" focusable="false">
          <rect className="workflow-photo-edge-base" x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="16" />
          <rect className="workflow-photo-edge-glow" x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="16" pathLength="100" />
          <rect className="workflow-photo-edge-light" x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="16" pathLength="100" />
        </svg>
      </div>
      <figcaption><span>{tag}</span><strong>{caption}</strong></figcaption>
      {!reducedMotion && (
        <button className="workflow-photo-motion" type="button" onPointerMove={(event) => event.stopPropagation()} onClick={() => { resetTilt(); setPaused((value) => !value); }} aria-label={locale === "es" ? (paused ? "Reanudar efecto de la foto" : "Pausar efecto de la foto") : (paused ? "Resume photo effect" : "Pause photo effect")}>
          <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true">{paused ? <path d="m5 3 8 5-8 5Z" fill="currentColor" /> : <path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="2" />}</svg>
        </button>
      )}
    </figure>
  );
}
