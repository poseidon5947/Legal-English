/** Extracted MPC artwork, with a reversed text version for dark surfaces. */
export function BrandMark({ className = "" }: { className?: string }) {
  const light = className.split(/\s+/).includes("light");
  return (
    <span className={`mpc-brand ${className}`.trim()}>
      <img
        src={`/brand/mpc-logo-extracted${light ? "-light" : ""}.png`}
        alt="MPC Law Studio — Legal English Training"
        width="1769"
        height="489"
      />
    </span>
  );
}
