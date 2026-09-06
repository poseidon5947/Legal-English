"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useLocale } from "@/components/locale-provider";
import type { VitalName } from "@/lib/insights";

/**
 * Sends anonymous page views and Core Web Vitals to our own /api/insights.
 * No third-party script, no cookie, no personal data (see lib/insights.ts).
 *
 * Measurement follows the web-vitals library's approach with the browser's
 * PerformanceObserver: LCP stops at first interaction/hide, CLS sums the
 * largest shift window, INP takes the worst interaction, TTFB comes from the
 * navigation entry. Everything is flushed with sendBeacon when the tab hides
 * or the route changes, so it never delays the page.
 */
export function InsightBeacon() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const queue = useRef<Record<string, unknown>[]>([]);
  const sid = useRef<string>("");
  const localeRef = useRef(locale);
  localeRef.current = locale;

  useEffect(() => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) return;
    // Local development and automated browsers would only pollute the numbers.
    if (navigator.webdriver) return;

    try {
      sid.current = sessionStorage.getItem("le5_sid") || Math.random().toString(36).slice(2, 12);
      sessionStorage.setItem("le5_sid", sid.current);
    } catch {
      sid.current = Math.random().toString(36).slice(2, 12);
    }

    const device = () => (window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop");
    const push = (event: Record<string, unknown>) => {
      queue.current.push({ ...event, locale: localeRef.current, device: device(), sid: sid.current });
    };
    const flush = () => {
      if (!queue.current.length) return;
      const body = JSON.stringify(queue.current.splice(0, 25));
      try {
        if (!navigator.sendBeacon || !navigator.sendBeacon("/api/insights", new Blob([body], { type: "application/json" }))) {
          void fetch("/api/insights", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => undefined);
        }
      } catch {
        /* ignore */
      }
    };

    const vitals = new Map<VitalName, number>();
    const report = (name: VitalName, value: number) => {
      // Each vital is reported once per page (final value at hide/navigation).
      vitals.set(name, value);
    };

    // TTFB
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav && nav.responseStart > 0) report("TTFB", nav.responseStart);

    const observers: PerformanceObserver[] = [];
    const observe = (type: string, callback: (entries: PerformanceEntry[]) => void, options: PerformanceObserverInit = {}) => {
      try {
        const observer = new PerformanceObserver((list) => callback(list.getEntries()));
        observer.observe({ type, buffered: true, ...options });
        observers.push(observer);
      } catch {
        /* unsupported entry type */
      }
    };

    // LCP: the last candidate before the first input / hide wins.
    let lcpFinal = false;
    observe("largest-contentful-paint", (entries) => {
      if (lcpFinal) return;
      const last = entries[entries.length - 1];
      if (last) report("LCP", last.startTime);
    });
    const finalizeLcp = () => {
      lcpFinal = true;
    };
    addEventListener("keydown", finalizeLcp, { once: true, capture: true });
    addEventListener("pointerdown", finalizeLcp, { once: true, capture: true });

    // CLS: session-window sum (1 s gap / 5 s max), largest window counts.
    let clsValue = 0;
    let windowValue = 0;
    let windowStart = 0;
    let windowLast = 0;
    observe("layout-shift", (entries) => {
      for (const entry of entries as (PerformanceEntry & { hadRecentInput: boolean; value: number })[]) {
        if (entry.hadRecentInput) continue;
        if (windowValue && entry.startTime - windowLast < 1000 && entry.startTime - windowStart < 5000) {
          windowValue += entry.value;
        } else {
          windowValue = entry.value;
          windowStart = entry.startTime;
        }
        windowLast = entry.startTime;
        if (windowValue > clsValue) {
          clsValue = windowValue;
          report("CLS", clsValue);
        }
      }
    });

    // INP: worst interaction duration (simplified: max over the page).
    let inp = 0;
    observe(
      "event",
      (entries) => {
        for (const entry of entries as (PerformanceEntry & { interactionId?: number })[]) {
          if (!entry.interactionId) continue;
          if (entry.duration > inp) {
            inp = entry.duration;
            report("INP", inp);
          }
        }
      },
      { durationThreshold: 40 } as PerformanceObserverInit
    );

    const currentPath = () => location.pathname;
    let path = currentPath();
    push({ kind: "view", path });
    // The view itself goes out quickly (idle), vitals follow at hide/navigation.
    const firstFlush = window.setTimeout(flush, 1500);

    const flushVitals = () => {
      for (const [name, value] of vitals) push({ kind: "vital", name, value, path });
      vitals.clear();
      flush();
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") {
        finalizeLcp();
        flushVitals();
      }
    };
    document.addEventListener("visibilitychange", onHide);
    addEventListener("pagehide", flushVitals);

    // Soft navigations: the App Router swaps content without a reload, so a
    // route change is a new "view" for the same tab.
    const onRoute = () => {
      const next = currentPath();
      if (next === path) return;
      finalizeLcp();
      flushVitals();
      path = next;
      push({ kind: "view", path });
      flush();
    };
    window.addEventListener("le5:route", onRoute);

    return () => {
      window.clearTimeout(firstFlush);
      document.removeEventListener("visibilitychange", onHide);
      removeEventListener("pagehide", flushVitals);
      window.removeEventListener("le5:route", onRoute);
      for (const observer of observers) observer.disconnect();
    };
  }, []);

  // Bridge Next's pathname changes into a DOM event the effect above listens to.
  useEffect(() => {
    window.dispatchEvent(new Event("le5:route"));
  }, [pathname]);

  return null;
}
