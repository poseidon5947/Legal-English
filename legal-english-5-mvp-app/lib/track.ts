import type { ActionName } from "@/lib/insights";

/**
 * First-party funnel events (brief §5 "measurement hooks"): distinguish
 * landing-page visits from primary CTA clicks and successful trial starts.
 * No third-party tracker, cookie or pixel: the event is handed to the same
 * anonymous InsightBeacon that already reports page views, and it carries
 * only the action name and a short placement label.
 */
export function trackAction(name: ActionName, label = "") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("le5:action", { detail: { name, label: label.slice(0, 32) } }));
}
