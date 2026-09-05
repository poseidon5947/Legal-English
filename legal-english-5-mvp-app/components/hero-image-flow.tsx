"use client";

import { useEffect, useState } from "react";
import { Photo } from "@/components/photo";

const SLIDES = ["hero-1", "hero-2", "hero-3", "hero-4", "hero-5", "hero-6"] as const;
const INTERVAL_MS = 4200;

type Slide = { caption: string; tag: string };

/**
 * Crossfading photo flow for the landing hero: real people at work and
 * study, one slide every ~4 seconds with a slow zoom. Pauses on hover and
 * respects prefers-reduced-motion (no zoom, still crossfades).
 */
export function HeroImageFlow({ slides }: { slides: ReadonlyArray<Slide> }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // Only the first slide is in the initial HTML; the other five mount after
  // hydration so they never compete with the LCP image and above-the-fold CSS.
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setWarm(true), 600);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setIndex((current) => (current + 1) % SLIDES.length), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused]);
  const current = slides[index % slides.length];
  return (
    <div
      className="hero-flow"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="group"
      aria-roledescription="carousel"
      aria-label={current?.caption}
    >
      {SLIDES.map((name, i) =>
        i === 0 || warm ? (
          <Photo
            key={name}
            className={`hero-flow-slide${i === index ? " active" : ""}`}
            src={`/home-assets/hero/${name}.jpg`}
            size="wide"
            sizes="(max-width: 960px) 100vw, 46vw"
            priority={i === 0}
            aria-hidden={i !== index}
          />
        ) : null,
      )}
      <div className="hero-flow-shade" />
      <div className="hero-flow-caption" key={index}>
        <span>{current?.tag}</span>
        <strong>{current?.caption}</strong>
      </div>
      <div className="hero-flow-dots" role="tablist" aria-label="Slides">
        {SLIDES.map((name, i) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={slides[i]?.caption || name}
            className={i === index ? "active" : ""}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
