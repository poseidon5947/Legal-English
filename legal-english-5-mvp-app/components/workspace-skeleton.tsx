/** Placeholder layout shown while the session bootstraps; mirrors LearnerShell so nothing jumps. */
export function WorkspaceSkeleton({ status, error, onRetry }: { status: string; error?: string; onRetry?: () => void }) {
  return (
    <main id="main" className="workspace-skeleton" aria-busy={!error} aria-live="polite">
      <aside className="sk-sidebar" aria-hidden="true">
        <div className="sk brand" />
        {Array.from({ length: 6 }, (_, i) => (
          <div className={`sk nav${i % 3 === 2 ? " short" : ""}`} key={i} />
        ))}
      </aside>
      <section className="sk-main">
        <div className="sk topbar" aria-hidden="true" />
        <div className="sk title" aria-hidden="true" />
        <div className="sk lead" aria-hidden="true" />
        <div className="sk-row" aria-hidden="true">
          <div className="sk block" />
          <div className="sk block" />
          <div className="sk block" />
          <div className="sk block" />
        </div>
        <div className="sk-cols" aria-hidden="true">
          <div className="sk card" />
          <div className="sk rail" />
        </div>
        {error && onRetry ? (
          <div className="sk-error" role="alert">
            <p>{error}</p>
            <button type="button" className="primary inline" onClick={onRetry}>
              {status}
            </button>
          </div>
        ) : (
          <p className="sk-status">{status}</p>
        )}
      </section>
    </main>
  );
}
