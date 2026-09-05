import { readFileSync } from "fs";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { DATA_MODE, store } from "@/lib/data-store";
import { avatarFile } from "@/lib/store";
import type { Progress, Term } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Habeas data: a signed-in learner downloads everything the service stores
 * about them — profile, subscription state, per-term progress and billing
 * events — as a single JSON file. Term titles are joined in for readability;
 * shared content itself (definitions, quizzes) is not part of the export.
 */
export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, message: "Sign in required." }, { status: 401 });

  const data = (await store.bootstrap(user.id)) as {
    session: { user: unknown; subscription: unknown } | null;
    terms: Term[];
    progress: Progress[];
    billingHistory?: unknown[];
  };
  const titles = new Map(data.terms.map((term) => [term.id, term.term]));
  const rows = data.progress
    .filter((row) => row.userId === user.id)
    .map((row) => ({
      termId: row.termId,
      term: titles.get(row.termId) ?? null,
      state: row.state,
      favourite: row.favourite,
      quizAttempts: row.attempts,
      updatedAt: row.updatedAt,
    }))
    .sort((a, b) => a.termId.localeCompare(b.termId));

  // The profile photo is personal data too: embed the stored bytes so the
  // export stands on its own (alpha reads the local file; production fetches
  // the signed Storage URL that bootstrap already produced).
  const profile = (data.session?.user ?? null) as (Record<string, unknown> & { avatarUrl?: string | null }) | null;
  let profilePhoto: { contentType: string; base64: string } | null = null;
  if (profile?.avatarUrl) {
    if (DATA_MODE === "alpha") {
      const file = avatarFile(user.id);
      if (file) profilePhoto = { contentType: file.contentType, base64: readFileSync(file.path).toString("base64") };
    } else {
      const response = await fetch(profile.avatarUrl).catch(() => null);
      if (response?.ok) {
        profilePhoto = { contentType: response.headers.get("content-type") || "image/webp", base64: Buffer.from(await response.arrayBuffer()).toString("base64") };
      }
    }
  }

  const payload = {
    format: "legal-english-5/learner-export",
    version: 2,
    exportedAt: new Date().toISOString(),
    profile,
    profilePhoto,
    subscription: data.session?.subscription ?? null,
    progress: rows,
    billingHistory: data.billingHistory ?? [],
    notes: {
      en: "This file contains every record Legal English 5 stores about your account. Shared course content (definitions, quizzes, audio) is not personal data and is not included.",
      es: "Este archivo contiene todos los registros que Legal English 5 guarda sobre tu cuenta. El contenido compartido del curso (definiciones, quizzes, audio) no es dato personal y no se incluye.",
    },
  };

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="legal-english-5-my-data-${stamp}.json"`,
      "cache-control": "no-store",
    },
  });
}
