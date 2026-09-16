import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public, unauthenticated build identity. Lets the Owner verify which commit
 * is live and when it was built without access to the hosting console
 * (client request, 16 Sep 2026: "commit o identificador de la versión
 * desplegada y fecha/hora exactas del despliegue"). No secrets: only the git
 * commit Vercel injects at build time and the build timestamp.
 */
export async function GET() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_GIT_COMMIT_SHA || null;
  return NextResponse.json(
    {
      commit: sha,
      shortCommit: sha ? sha.slice(0, 7) : null,
      branch: process.env.VERCEL_GIT_COMMIT_REF || null,
      builtAt: process.env.NEXT_PUBLIC_BUILD_TIME || null,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || null,
      serverTime: new Date().toISOString(),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
