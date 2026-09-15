// Stand-in for next/headers when app modules run under node:test (no request
// scope exists). The alpha store only reads the session cookie through it.
export async function cookies() {
  return { get: () => undefined, set: () => undefined, delete: () => undefined };
}
