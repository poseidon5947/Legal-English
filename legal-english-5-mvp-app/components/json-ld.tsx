/**
 * Structured data (schema.org JSON-LD) for search engines and link previews.
 *
 * Rendered as a plain <script type="application/ld+json">. The component is
 * safe to use from server and client components alike: client components are
 * still server-rendered, so the tag is in the HTML crawlers receive.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  // "<" is escaped so a string field can never close the script element.
  const payload = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: payload }} />;
}
