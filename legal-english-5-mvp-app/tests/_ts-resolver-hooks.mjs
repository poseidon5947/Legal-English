// Module resolution hooks so node:test can import app TypeScript modules that
// use the "@/…" alias or extensionless relative imports (Node 22 strips the
// types itself). Registered per test file with `register()`; the npm script
// is unchanged.
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve as resolvePath } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

export async function resolve(specifier, context, nextResolve) {
  let target;
  if (specifier.startsWith("@/")) target = pathToFileURL(resolvePath(ROOT, specifier.slice(2))).href;
  else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) target = new URL(specifier, context.parentURL).href;
  else return nextResolve(specifier, context);

  const path = fileURLToPath(target);
  if (!/\.[cm]?[jt]sx?$/.test(path)) {
    for (const ext of [".ts", ".tsx", ".mjs", ".js"]) {
      if (existsSync(path + ext)) return nextResolve(pathToFileURL(path + ext).href, context);
    }
  }
  return nextResolve(target, context);
}
