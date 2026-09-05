"use client";

import { useEffect, useState } from "react";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";
import type { LegalSection } from "@/lib/legal-content";
import { learnerText } from "@/lib/learner-copy";
import { formatDate } from "@/lib/learner-stats";

function slug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Shared layout for Privacy / Terms: photo banner, heading, sticky
 * "On this page" table of contents that tracks the section in view,
 * numbered sections with anchor links, and a last-updated line.
 */
export function LegalDocument({
  photo,
  eyebrow,
  title,
  lead,
  sections,
  updatedAt,
}: {
  photo: string;
  eyebrow: string;
  title: string;
  lead: string;
  sections: LegalSection[];
  updatedAt: string;
}) {
  const { locale, t } = useLocale();
  const ids = sections.map((section) => slug(section.title));
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join("|")]);

  return (
    <main className="landing home-reference">
      <LandingHeader />
      <section className="landing-section legal-page">
        <figure className="legal-banner" aria-hidden="true">
          <img src={photo} alt="" />
        </figure>
        <div className="landing-section-heading">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{lead}</p>
          <p className="legal-updated">
            {learnerText(locale, "lastUpdated")}: {formatDate(updatedAt, locale)}
          </p>
        </div>
        <div className="legal-layout">
          <nav className="legal-toc" aria-label={learnerText(locale, "onThisPage")}>
            <strong>{learnerText(locale, "onThisPage")}</strong>
            <ol>
              {sections.map((section, index) => (
                <li key={ids[index]}>
                  <a href={`#${ids[index]}`} className={active === ids[index] ? "active" : ""}>
                    <span>{index + 1}</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="legal-body">
            {sections.map((section, index) => (
              <section key={ids[index]} id={ids[index]}>
                <h3>
                  <a href={`#${ids[index]}`} className="legal-anchor" aria-hidden="true">
                    {index + 1}.
                  </a>{" "}
                  {section.title}
                </h3>
                <p>{section.body}</p>
              </section>
            ))}
            <p className="muted tiny legal-note">{t("legalDraftNote")}</p>
          </div>
        </div>
      </section>
      <LandingFooter />
    </main>
  );
}
