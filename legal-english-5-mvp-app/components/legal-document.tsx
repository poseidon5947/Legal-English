"use client";

import { Fragment, useEffect, useState } from "react";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { useLocale } from "@/components/locale-provider";
import { Photo } from "@/components/photo";
import { LEGAL_DOCS, LEGAL_EFFECTIVE_DATE, LEGAL_VERSION_HISTORY, SIC_PORTAL_URL, type LegalBlock, type LegalDocKey } from "@/lib/legal-content";
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

const LINK_PATTERN = /(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.-]+)/g;

/** Turn bare URLs and e-mail addresses in the approved text into links without altering the wording. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(LINK_PATTERN);
  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 0) return <Fragment key={index}>{part}</Fragment>;
        const trailing = part.match(/[.,;:]+$/)?.[0] ?? "";
        const target = part.slice(0, part.length - trailing.length);
        const href = target.startsWith("http") ? target : `mailto:${target}`;
        return (
          <Fragment key={index}>
            <a href={href} target={target.startsWith("http") ? "_blank" : undefined} rel={target.startsWith("http") ? "noreferrer" : undefined}>
              {target}
            </a>
            {trailing}
          </Fragment>
        );
      })}
    </>
  );
}

function Blocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "p") {
          return (
            <p key={index}>
              <Linkified text={block.text} />
            </p>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Linkified text={item} />
                </li>
              ))}
            </ul>
          );
        }
        const [head, ...rows] = block.rows;
        const keyValue = block.rows.every((row) => row.length === 2);
        return (
          <div key={index} className="legal-table-wrap">
            <table className="legal-table">
              {keyValue ? (
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <th scope="row">{row[0]}</th>
                      <td>
                        <Linkified text={row[1]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <>
                  <thead>
                    <tr>
                      {head.map((cell, cellIndex) => (
                        <th key={cellIndex} scope="col">
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>
                            <Linkified text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          </div>
        );
      })}
    </>
  );
}

const COPY = {
  en: {
    print: "Print or save as PDF",
    prevails: "Published in Spanish and English. If the versions differ, the Spanish version prevails.",
    history: "Version history",
    version: "Version",
    sic: "Superintendence of Industry and Commerce (SIC) portal",
    related: "Related documents",
    terms: "Terms of Service",
    privacy: "Personal Data Processing and Privacy Policy",
    cookies: "Cookie Policy",
  },
  es: {
    print: "Imprimir o guardar como PDF",
    prevails: "Publicado en español e inglés. En caso de diferencia, prevalece la versión en español.",
    history: "Historial de versiones",
    version: "Versión",
    sic: "Portal de la Superintendencia de Industria y Comercio (SIC)",
    related: "Documentos relacionados",
    terms: "Términos del Servicio",
    privacy: "Política de Tratamiento de Datos Personales y Privacidad",
    cookies: "Política de Cookies",
  },
} as const;

const PATHS: Record<LegalDocKey, string> = { terms: "/terms-of-service", privacy: "/privacy", cookies: "/cookies" };

/**
 * Shared layout for the three approved legal documents: optional photo banner, heading
 * with the effective date, sticky "On this page" table of contents, numbered
 * sections with anchor links, print/save control, version history and the SIC
 * link required by the package annex. Texts come verbatim from lib/legal-content.
 */
export function LegalDocument({ doc, photo, eyebrow }: { doc: LegalDocKey; photo?: string; eyebrow: string }) {
  const { locale } = useLocale();
  const content = LEGAL_DOCS[doc][locale];
  const copy = COPY[locale];
  const ids = content.sections.map((section) => slug(section.title));
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
    <main id="main" className="landing home-reference">
      <LandingHeader />
      <section className="landing-section legal-page">
        {/* NEW-09: Privacy and Cookies open directly on the title; only the Terms of Service keep the banner. */}
        {photo && (
          <figure className="legal-banner" aria-hidden="true">
            <Photo src={photo} size="wide" priority />
          </figure>
        )}
        <div className="landing-section-heading">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{content.title}</h1>
          <p className="legal-updated">{content.effective}</p>
          <p className="legal-prevails">{copy.prevails}</p>
          <div className="legal-actions">
            <button type="button" className="secondary" onClick={() => window.print()}>
              {copy.print}
            </button>
          </div>
        </div>
        <div className="legal-layout">
          <nav className="legal-toc" aria-label={learnerText(locale, "onThisPage")}>
            <strong>{learnerText(locale, "onThisPage")}</strong>
            <ol>
              {content.sections.map((section, index) => (
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
            {content.intro.length > 0 && (
              <section className="legal-intro">
                <Blocks blocks={content.intro} />
              </section>
            )}
            {content.sections.map((section, index) => (
              <section key={ids[index]} id={ids[index]}>
                <h3>
                  <a href={`#${ids[index]}`} className="legal-anchor" aria-hidden="true">
                    {index + 1}.
                  </a>{" "}
                  {section.title}
                </h3>
                <Blocks blocks={section.blocks} />
              </section>
            ))}
            <section className="legal-meta">
              <h3>{copy.history}</h3>
              <ul>
                {LEGAL_VERSION_HISTORY.map((entry) => (
                  <li key={entry.version}>
                    <strong>
                      {copy.version} {entry.version}
                    </strong>{" "}
                    · {formatDate(entry.effective, locale)} — {entry.note[locale]}
                  </li>
                ))}
              </ul>
              <p className="tiny muted">
                {learnerText(locale, "lastUpdated")}: {formatDate(LEGAL_EFFECTIVE_DATE, locale)}
              </p>
              <h3>{copy.related}</h3>
              <ul>
                {(Object.keys(PATHS) as LegalDocKey[])
                  .filter((key) => key !== doc)
                  .map((key) => (
                    <li key={key}>
                      <a href={PATHS[key]}>{copy[key]}</a>
                    </li>
                  ))}
                <li>
                  <a href={SIC_PORTAL_URL} target="_blank" rel="noreferrer">
                    {copy.sic}
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </section>
      <LandingFooter />
    </main>
  );
}
