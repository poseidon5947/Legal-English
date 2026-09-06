"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

function focusables(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);
}

/**
 * Keyboard containment for modal surfaces (shortcut dialog, mobile drawer).
 * While `active`:
 *  - focus moves into the container (first focusable, else the container),
 *  - Tab / Shift+Tab cycle inside it,
 *  - every other child of <body> is made `inert`, so screen readers and
 *    pointer/keyboard users cannot reach the page behind,
 *  - on close, focus returns to the element that opened it.
 */
export function useFocusTrap(active: boolean, ref: RefObject<HTMLElement | null>, allow: RefObject<HTMLElement | null>[] = []) {
  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;
    // Elements that stay interactive even though they sit outside the
    // container (e.g. the drawer's backdrop close button).
    const keep = new Set(allow.map((item) => item.current).filter(Boolean));
    const opener = document.activeElement as HTMLElement | null;

    // Make everything outside the container inert. The container may be
    // nested deep in the page, so walk up and inert each level's siblings.
    const made: Element[] = [];
    let node: HTMLElement | null = container;
    while (node && node !== document.body) {
      const parent: HTMLElement | null = node.parentElement;
      if (!parent) break;
      for (const sibling of Array.from(parent.children)) {
        if (sibling !== node && !keep.has(sibling as HTMLElement) && !sibling.hasAttribute("inert") && sibling.tagName !== "SCRIPT") {
          sibling.setAttribute("inert", "");
          made.push(sibling);
        }
      }
      node = parent;
    }

    if (!container.hasAttribute("tabindex")) container.setAttribute("tabindex", "-1");
    const first = focusables(container)[0];
    (first ?? container).focus({ preventScroll: true });

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const list = focusables(container);
      if (!list.length) {
        event.preventDefault();
        container.focus();
        return;
      }
      const start = list[0];
      const end = list[list.length - 1];
      const current = document.activeElement as HTMLElement | null;
      if (event.shiftKey && (current === start || !container.contains(current))) {
        event.preventDefault();
        end.focus();
      } else if (!event.shiftKey && (current === end || !container.contains(current))) {
        event.preventDefault();
        start.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);

    return () => {
      document.removeEventListener("keydown", onKey, true);
      for (const element of made) element.removeAttribute("inert");
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ref]);
}
