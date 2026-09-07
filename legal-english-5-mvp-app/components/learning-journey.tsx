"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const ICONS = ["workflow-book", "workflow-chat", "workflow-quiz", "workflow-growth"];
type Point = { x: number; y: number };

// Rounded elbows keep the long return connection in the space between the rows.
function roundedPath(points: Point[]) {
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1], b = points[i], c = points[i + 1];
    const before = Math.hypot(b.x - a.x, b.y - a.y);
    const after = Math.hypot(c.x - b.x, c.y - b.y);
    const radius = Math.min(14, before / 2, after / 2);
    if (!before || !after) continue;
    path += ` L ${b.x + (a.x - b.x) * radius / before} ${b.y + (a.y - b.y) * radius / before}`;
    path += ` Q ${b.x} ${b.y} ${b.x + (c.x - b.x) * radius / after} ${b.y + (c.y - b.y) * radius / after}`;
  }
  return `${path} L ${points.at(-1)!.x} ${points.at(-1)!.y}`;
}

export function LearningJourney({ steps, label, locale }: { locale: "en" | "es"; steps: ReadonlyArray<readonly [string, string]>; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = element.getBoundingClientRect();
        const nodes = [...element.querySelectorAll<HTMLElement>(".journey-node")].map((node) => {
          const box = node.getBoundingClientRect();
          return { x: box.left - bounds.left + box.width / 2, y: box.top - bounds.top + box.height / 2, radius: box.width / 2 + 12 };
        });
        const items = [...element.querySelectorAll<HTMLElement>(".journey-step")].map((item) => item.getBoundingClientRect());
        const nextPaths = nodes.slice(0, -1).map((a, i) => {
          const b = nodes[i + 1];
          if (Math.abs(a.x - b.x) < 2) return `M ${a.x} ${a.y + a.radius} L ${b.x} ${b.y - b.radius}`;
          if (Math.abs(a.y - b.y) < 2) return `M ${a.x + a.radius} ${a.y} L ${b.x - b.radius} ${b.y}`;
          const gapY = (Math.max(items[0].bottom, items[1].bottom) + items[i + 1].top) / 2 - bounds.top;
          return roundedPath([
            { x: a.x + a.radius, y: a.y }, { x: bounds.width - 9, y: a.y },
            { x: bounds.width - 9, y: gapY }, { x: 9, y: gapY },
            { x: 9, y: b.y }, { x: b.x - b.radius, y: b.y },
          ]);
        });
        setPaths((current) => JSON.stringify(current) === JSON.stringify(nextPaths) ? current : nextPaths);
      });
    };
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    element.querySelectorAll(".journey-step, .journey-node").forEach((node) => resize.observe(node));
    const intersection = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .15 });
    intersection.observe(element);
    const visibility = () => setPageVisible(!document.hidden);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return (
    <div className="learning-journey" ref={root} data-running={visible && pageVisible && !paused}>
      <svg className="journey-connections" aria-hidden="true" focusable="false">
        {paths.map((path, i) => (
          <g key={i} style={{ "--signal-delay": `${1 + i * 2.5}s` } as CSSProperties}>
            <path className="journey-track" d={path} />
            <path className="journey-track-dots" d={path} />
            <path className="journey-signal-glow" d={path} pathLength="100" />
            <path className="journey-signal" d={path} pathLength="100" />
          </g>
        ))}
      </svg>
      <ol className="journey-steps" aria-label={label}>
        {steps.map(([title, body], i) => (
          <li className="journey-step" key={i} style={{ "--step-delay": `${i * 2.5}s` } as CSSProperties}>
            <div className="journey-node">
              <svg className="journey-orbit" viewBox="0 0 112 112" aria-hidden="true" focusable="false">
                <circle className="journey-ring" cx="56" cy="56" r="53" />
                <circle className="journey-ring-ticks" cx="56" cy="56" r="48" />
                <g className="journey-orbit-spin"><circle className="journey-ring-arc" cx="56" cy="56" r="53" /><circle className="journey-orbit-light" cx="109" cy="56" r="2.8" /></g>
              </svg>
              <span className="journey-step-number" aria-hidden="true">0{i + 1}</span>
              <img src={`/home-assets/icons/${ICONS[i]}.png`} width="56" height="56" alt="" loading="lazy" />
            </div>
            <div className="journey-copy"><h3>{title}</h3><p>{body}</p></div>
          </li>
        ))}
      </ol>
      <button className="journey-motion-toggle" type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused}>
        <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">{paused ? <path d="m5 3 8 5-8 5Z" fill="currentColor" /> : <path d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="2" />}</svg>
        {locale === "es" ? (paused ? "Reanudar animación" : "Pausar animación") : (paused ? "Resume animation" : "Pause animation")}
      </button>
    </div>
  );
}
