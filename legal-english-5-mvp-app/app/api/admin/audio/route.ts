import { json, requireUser } from "@/lib/api";
import { canonicalAudioName, extensionOf, parseAudioFilename, storagePathFor, type AudioJurisdiction } from "@/lib/audio-naming";
import { DATA_MODE, store } from "@/lib/data-store";
import { removeAudio as removeAlphaAudio, saveAudio as saveAlphaAudio } from "@/lib/store";
import { AUDIO_BUCKET } from "@/lib/store.supabase";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Owner audio flow (Solicitud §3.5 + client point 8, Delivery Mapping C-05):
// upload, replace, remove, and bulk association by filename. Two shapes:
//   single: termId + jurisdiction + file   (from the Term editor)
//   bulk:   files[] named {TermID}_US|UK.{ext}   (from the Terms tab)
// The Owner produces the recordings; this only stores and associates them.

type UploadResult = { file: string; termId?: string; jurisdiction?: AudioJurisdiction; status: "stored" | "rejected"; message: string };

async function storeOne(actorId: string, termId: string, jurisdiction: AudioJurisdiction, file: File, extension: string) {
  if (DATA_MODE === "alpha") {
    return saveAlphaAudio(actorId, termId, jurisdiction, Buffer.from(await file.arrayBuffer()), extension);
  }
  const admin = getSupabaseServiceRoleClient();
  const { data: term } = await admin.from("terms").select("id").eq("id", termId).maybeSingle();
  if (!term) return { ok: false as const, message: `TermID ${termId} does not exist; upload rejected.` };
  const path = storagePathFor(termId, jurisdiction, extension);
  const { error: uploadError } = await admin.storage.from(AUDIO_BUCKET).upload(path, file, { upsert: true, contentType: file.type || "audio/mpeg" });
  if (uploadError) return { ok: false as const, message: uploadError.message };
  const column = jurisdiction === "us" ? "audio_us_path" : "audio_uk_path";
  const { error: updateError } = await admin.from("terms").update({ [column]: path, updated_at: new Date().toISOString() }).eq("id", termId);
  if (updateError) return { ok: false as const, message: updateError.message };
  return { ok: true as const, path };
}

async function removeOne(actorId: string, termId: string, jurisdiction: AudioJurisdiction) {
  if (DATA_MODE === "alpha") return removeAlphaAudio(actorId, termId, jurisdiction);
  const admin = getSupabaseServiceRoleClient();
  const column = jurisdiction === "us" ? "audio_us_path" : "audio_uk_path";
  const { data: term } = await admin.from("terms").select(`id, published, ${column}`).eq("id", termId).maybeSingle();
  if (!term) return { ok: false as const, message: "Term not found." };
  const current = (term as Record<string, unknown>)[column] as string | null;
  if (current) await admin.storage.from(AUDIO_BUCKET).remove([current]);
  // AudioUS is a publication requirement; removing it demotes the Term.
  const demote = jurisdiction === "us" || termId === "EMP-009";
  const { error } = await admin
    .from("terms")
    .update({ [column]: null, ...(demote ? { published: false } : {}), updated_at: new Date().toISOString() })
    .eq("id", termId);
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const };
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (user?.role !== "admin") return json({ ok: false, message: "Owner access required." }, 403);
  const form = await request.formData();

  const bulk = form.getAll("files").filter((entry): entry is File => entry instanceof File);
  const results: UploadResult[] = [];

  if (bulk.length) {
    for (const file of bulk) {
      const parsed = parseAudioFilename(file.name);
      if (!parsed.ok) {
        results.push({ file: file.name, status: "rejected", message: parsed.reason });
        continue;
      }
      const stored = await storeOne(user.id, parsed.termId, parsed.jurisdiction, file, parsed.extension);
      results.push({
        file: file.name,
        termId: parsed.termId,
        jurisdiction: parsed.jurisdiction,
        status: stored.ok ? "stored" : "rejected",
        message: stored.ok ? `Associated to ${parsed.termId} (${parsed.jurisdiction.toUpperCase()}).` : stored.message,
      });
    }
  } else {
    const termId = String(form.get("termId") || "");
    const jurisdiction = String(form.get("jurisdiction") || "");
    const file = form.get("file");
    if (!termId || (jurisdiction !== "us" && jurisdiction !== "uk") || !(file instanceof File)) {
      return json({ ok: false, message: "termId, jurisdiction (us|uk) and an audio file are required." }, 400);
    }
    const extension = extensionOf(file.name);
    if (!extension) return json({ ok: false, message: "Allowed audio containers: mp3, m4a, wav, ogg." }, 400);
    const stored = await storeOne(user.id, termId, jurisdiction, file, extension);
    results.push({
      file: file.name,
      termId,
      jurisdiction,
      status: stored.ok ? "stored" : "rejected",
      message: stored.ok ? `Stored as ${canonicalAudioName(termId, jurisdiction, extension)}.` : stored.message,
    });
  }

  const bootstrapData = await store.bootstrap(user.id);
  const stored = results.filter((item) => item.status === "stored").length;
  const rejected = results.length - stored;
  return json({
    ok: stored > 0 || results.length === 0,
    message: `${stored} audio file(s) stored, ${rejected} rejected.`,
    results,
    terms: bootstrapData.terms,
  });
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if (user?.role !== "admin") return json({ ok: false, message: "Owner access required." }, 403);
  const body = (await request.json().catch(() => ({}))) as { termId?: string; jurisdiction?: string };
  if (!body.termId || (body.jurisdiction !== "us" && body.jurisdiction !== "uk")) {
    return json({ ok: false, message: "termId and jurisdiction (us|uk) are required." }, 400);
  }
  const result = await removeOne(user.id, body.termId, body.jurisdiction);
  if (!result.ok) return json(result, 400);
  const bootstrapData = await store.bootstrap(user.id);
  return json({ ok: true, terms: bootstrapData.terms });
}
