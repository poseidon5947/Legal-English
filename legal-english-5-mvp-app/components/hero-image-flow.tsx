"use client";

import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/photo";
import { useLocale } from "@/components/locale-provider";

const SLIDES = ["hero-1", "hero-2", "hero-3", "hero-4", "hero-5", "hero-6"] as const;
const INTERVAL_MS = 5000;
const TRANSITION_MS = 900;
type Slide = { caption: string; tag: string };

/** A perspective stack: the outgoing photograph lifts away as the next moves forward. */
export function HeroImageFlow({ slides }: { slides: ReadonlyArray<Slide> }) {
  const { locale } = useLocale();
  const spanish = locale === "es";
  const count = Math.min(SLIDES.length, slides.length);
  const [index, setIndex] = useState(0);
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [warm, setWarm] = useState(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(motion.matches);
    const updateVisibility = () => setHidden(document.hidden);
    updateMotion();
    updateVisibility();
    motion.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const preload = window.setTimeout(() => setWarm(true), 600);
    const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting));
    if (container.current) observer.observe(container.current);
    return () => {
      observer.disconnect();
      window.clearTimeout(preload);
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      motion.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  function goTo(next: number) {
    if (count < 2 || transitionTimer.current || next === index) return;
    setWarm(true);
    if (!reducedMotion) {
      setOutgoing(index);
      transitionTimer.current = setTimeout(() => {
        setOutgoing(null);
        transitionTimer.current = null;
      }, TRANSITION_MS);
    }
    setIndex(next);
  }

  useEffect(() => {
    if (count < 2 || paused || hovered || focused || hidden || offscreen || reducedMotion || outgoing !== null) return;
    const timer = window.setTimeout(() => goTo((index + 1) % count), INTERVAL_MS);
    return () => window.clearTimeout(timer);
    // goTo uses the current index and motion preference, both dependencies below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, count, paused, hovered, focused, hidden, offscreen, reducedMotion, outgoing]);

  if (!count) return null;
  return (
    <div
      ref={container}
      className="hero-flow hero-depth"
      data-motion={paused || hovered || focused || hidden || offscreen || reducedMotion ? "paused" : "running"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={(event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        goTo((index + (event.key === "ArrowRight" ? 1 : count - 1)) % count);
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label={spanish ? "El inglés jurídico en la práctica" : "Legal English in practice"}
    >
      <div className="hero-depth-stage">
        {SLIDES.slice(0, count).map((name, i) => {
          if (i !== 0 && !warm) return null;
          const position = (i - index + count) % count;
          const layer = position === 0 ? "front" : position === 1 ? "middle" : position === 2 ? "back" : "waiting";
          return (
            <div
              key={name}
              className={`hero-depth-card ${layer} hero-camera-${(i % 3) + 1}${outgoing === i ? " departing" : ""}`}
              aria-hidden={i !== index}
              role="group"
              aria-roledescription={spanish ? "diapositiva" : "slide"}
              aria-label={`${i + 1} / ${count}`}
            >
              <Photo src={`/home-assets/hero/${name}.jpg`} size="wide" sizes="(max-width: 960px) 90vw, 43vw" priority={i === 0} loading={i === 0 ? "eager" : "lazy"} />
              <div className="hero-flow-shade" />
              <div className="hero-flow-caption">
                <span>{slides[i].tag}</span>
                <strong>{slides[i].caption}</strong>
              </div>
            </div>
          );
        })}
      </div>
      <div className="hero-depth-controls">
        <span className="hero-depth-count" aria-hidden="true"><b>{String(index + 1).padStart(2, "0")}</b><i />{String(count).padStart(2, "0")}</span>
        <div className="hero-depth-dots" aria-label={spanish ? "Elegir imagen" : "Choose image"}>
          {SLIDES.slice(0, count).map((name, i) => (
            <button key={name} type="button" aria-current={i === index ? "true" : undefined} aria-label={`${i + 1}: ${slides[i].caption}`} aria-disabled={outgoing !== null || undefined} onClick={() => goTo(i)}><span /></button>
          ))}
        </div>
        {!reducedMotion && count > 1 && (
          <button className="hero-depth-play" type="button" onClick={() => setPaused((value) => !value)} aria-label={spanish ? (paused ? "Reproducir presentación" : "Pausar presentación") : (paused ? "Play slideshow" : "Pause slideshow")}>
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">{paused ? <path d="m7 4 9 6-9 6Z" fill="currentColor" /> : <path d="M7 4v12M13 4v12" stroke="currentColor" strokeWidth="2" />}</svg>
          </button>
        )}
      </div>
      <span className="sr-only" aria-live={paused || focused || reducedMotion ? "polite" : "off"} aria-atomic="true">{slides[index].caption}</span>
    </div>
  );
}
