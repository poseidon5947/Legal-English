import { json, requireUser } from "@/lib/api";
import { DATA_MODE, store } from "@/lib/data-store";
import { AUDIO_BUCKET } from "@/lib/store.supabase";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await requireUser();
  if (user?.role !== "admin") return json({ ok: false, message: "Owner access required." }, 403);
  if (DATA_MODE !== "production") {
    return json({ ok: false, message: "Audio upload needs Supabase Storage (production mode). Alpha review keeps the manual path field." }, 400);
  }
  const form = await request.formData();
  const termId = String(form.get("termId") || "");
  const jurisdiction = String(form.get("jurisdiction") || "");
  const file = form.get("file");
  if (!termId || (jurisdiction !== "us" && jurisdiction !== "uk") || !(file instanceof File)) {
    return json({ ok: false, message: "termId, jurisdiction (us|uk) and an audio file are required." }, 400);
  }
  const extension = (file.name.split(".").pop() || "mp3").toLowerCase();
  const path = `${termId}/${jurisdiction}.${extension}`;
  const supabase = await getSupabaseServerClient();
  const { error: uploadError } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || "audio/mpeg" });
  if (uploadError) return json({ ok: false, message: uploadError.message }, 400);
  const column = jurisdiction === "us" ? "audio_us_path" : "audio_uk_path";
  const { error: updateError } = await supabase
    .from("terms")
    .update({ [column]: path, updated_at: new Date().toISOString() })
    .eq("id", termId);
  if (updateError) return json({ ok: false, message: updateError.message }, 400);
  const bootstrapData = await store.bootstrap(user.id);
  return json({ ok: true, terms: bootstrapData.terms });
}
