"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Photo } from "@/components/photo";
import type { LandingCopy } from "@/lib/landing-copy";

const photos = ["scenario-negotiation", "scenario-boardroom", "scenario-onboarding"];
const routes = ["Contracts", "Corporate Law", "Employment Law"];
const terms = [
  ["binding", "consideration", "breach"],
  ["board of directors", "resolution", "share issuance"],
  ["employment agreement", "overtime", "workplace harassment"],
];
const labels = {
  en: { tabs: "Choose a legal situation", previous: "Previous situation", next: "Next situation", case: "In practice", count: "Situation", of: "of", categories: ["Contracts", "Corporate", "Employment"], contexts: ["Cross-border negotiations", "Boardroom decisions", "International workplaces"] },
  es: { tabs: "Elige una situación jurídica", previous: "Situación anterior", next: "Situación siguiente", case: "En la práctica", count: "Situación", of: "de", categories: ["Contratos", "Societario", "Laboral"], contexts: ["Negociaciones internacionales", "Decisiones de la junta", "Entornos laborales globales"] },
};

export function ScenarioSlider({ copy, locale }: { copy: LandingCopy["scenarios"]; locale: "en" | "es" }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const gesture = useRef<{ x: number; y: number; pointer: number } | null>(null);
  const t = labels[locale];
  const select = (index: number) => setActive((index + copy.items.length) % copy.items.length);
  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % copy.items.length;
    else if (event.key === "ArrowLeft") next = (index + copy.items.length - 1) % copy.items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = copy.items.length - 1;
    else return;
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  }
  return (
    <div className="case-slider" lang={locale} data-reveal>
      <div className="case-tabs" role="tablist" aria-label={t.tabs}>
        {copy.items.map(([title], index) => (
          <button key={title} type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} ref={el => { tabs.current[index] = el; }} onClick={() => select(index)} onKeyDown={event => onKey(event, index)}>
            <span className="case-tab-number" aria-hidden="true">0{index + 1}</span>
            <span><strong>{t.categories[index]}</strong><small>{t.contexts[index]}</small></span>
            <span className="case-tab-arrow" aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
      {copy.items.map(([title, body], index) => (
        <div className="case-panel" role="tabpanel" key={title} id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`} hidden={active !== index} tabIndex={0}>
          <figure className="case-image" onPointerDown={event => {
            if (event.pointerType === "mouse" || !event.isPrimary) return;
            gesture.current = { x: event.clientX, y: event.clientY, pointer: event.pointerId };
            event.currentTarget.setPointerCapture(event.pointerId);
          }} onPointerCancel={() => { gesture.current = null; }} onPointerUp={event => {
            const start = gesture.current;
            gesture.current = null;
            if (!start || start.pointer !== event.pointerId) return;
            const dx = event.clientX - start.x;
            const dy = event.clientY - start.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) select(active + (dx < 0 ? 1 : -1));
          }}>
            <Photo src={`/home-assets/photos/${photos[index]}.jpg`} size="wide" sizes="(max-width: 700px) 100vw, 600px" draggable={false} />
            <span className="case-image-index" aria-hidden="true">0{index + 1}</span>
            <figcaption><span>{t.case}</span><strong>{t.contexts[index]}</strong></figcaption>
          </figure>
          <div className="case-copy">
            <span className="case-category">{t.categories[index]}</span>
            <h3>{title}</h3>
            <p>{body}</p>
            <div className="case-vocabulary"><span>{copy.termsLabel}</span><ul>{terms[index].map(term => <li key={term} lang="en">{term}</li>)}</ul></div>
            <Link href={`/terms?category=${encodeURIComponent(routes[index])}`}>{copy.explore}</Link>
          </div>
        </div>
      ))}
      <div className="case-controls">
        <span className="case-position" aria-live="polite" aria-atomic="true">{t.count} <strong>0{active + 1}</strong> <span>{t.of} 03</span></span>
        <div className="case-progress" aria-hidden="true">{copy.items.map((_, index) => <span key={index} data-active={index === active} />)}</div>
        <div className="case-arrows"><button type="button" aria-label={t.previous} onClick={() => select(active - 1)}>←</button><button type="button" aria-label={t.next} onClick={() => select(active + 1)}>→</button></div>
      </div>
    </div>
  );
}
