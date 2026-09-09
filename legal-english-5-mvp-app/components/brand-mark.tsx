/** Product name first, studio second (change request CR-07). */
export function BrandMark({ className = "" }: { className?: string }) {
  const light = className.split(/\s+/).includes("light");
  return (
    <span className={`mpc-brand product-first ${className}`.trim()}>
      <span className="mpc-brand-product">
        <strong>Legal English 5</strong>
        <small>by MPC LAW STUDIO</small>
      </span>
      <img
        src={`/brand/mpc-logo-extracted${light ? "-light" : ""}.png`}
        alt=""
        width="1769"
        height="489"
        aria-hidden="true"
      />
    </span>
  );
}
