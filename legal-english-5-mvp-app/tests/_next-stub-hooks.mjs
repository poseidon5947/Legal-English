// Resolver hook: route `next/headers` to tests/_next-headers-stub.mjs so lib
// modules that touch the request scope can be imported from node:test.
export async function resolve(specifier, context, nextResolve) {
  if (specifier === "next/headers") return nextResolve(new URL("./_next-headers-stub.mjs", import.meta.url).href, context);
  return nextResolve(specifier, context);
}
