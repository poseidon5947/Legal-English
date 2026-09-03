export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`.trim()}>
      <img src="/brand/icon.svg" alt="" width={40} height={40} />
      <span className="brand-text">
        <span>Legal</span>
        <span>
          English <b>5</b>
        </span>
      </span>
    </span>
  );
}
