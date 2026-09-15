/**
 * Approved logo (Design Freeze Pack v1.0, 15 Sep 2026):
 *  - L01 Primary Light on white / light surfaces, L02 Primary Dark on Brand
 *    Dark (`className="light"`), always with the full "BY MPC LAW STUDIO"
 *    endorsement.
 *  - The primary logo has a 260 px minimum digital width. Where the layout is
 *    narrower than that (phone headers), CSS swaps in the L04/L05 monogram.
 * Both variants are the supplied path-only SVGs — never recreated from text.
 */
export function BrandMark({ className = "" }: { className?: string }) {
  const light = className.split(/\s+/).includes("light");
  const alt = "Legal English 5 by MPC LAW STUDIO";
  return (
    <span className={`mpc-brand le5-brand ${className}`.trim()}>
      <img
        className="le5-brand-primary"
        src={light ? "/brand/le5-primary-dark.svg" : "/brand/le5-primary-light.svg"}
        alt={alt}
        width="1100"
        height="270"
      />
      <img
        className="le5-brand-monogram"
        src={light ? "/brand/le5-monogram-dark.svg" : "/brand/le5-monogram-light.svg"}
        alt={alt}
        width="512"
        height="512"
      />
    </span>
  );
}
