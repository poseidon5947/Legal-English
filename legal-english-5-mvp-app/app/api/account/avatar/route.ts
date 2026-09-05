import { readFileSync } from "fs";
import { json, requireUser } from "@/lib/api";
import { DATA_MODE, store } from "@/lib/data-store";
import { sniffImage } from "@/lib/image-sniff";
import { avatarFile } from "@/lib/store";

export const runtime = "nodejs";

// Profile photo (Account panel).
//   POST   multipart { file }  — store/replace the signed-in user's photo
//   DELETE                     — remove it (falls back to initials)
//   GET                        — alpha only: serve the signed-in user's own
//                                bytes. Production hands out signed Storage
//                                URLs from lib/store.supabase.ts instead.
// The browser crops and downsizes to 256x256 WebP before uploading
// (components/avatar-picker.tsx); the server still re-validates the bytes so
// the limits hold for anyone calling the endpoint directly.

const AVATAR_MAX_BYTES = 512 * 1024;
const AVATAR_MAX_SIDE = 1024;

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return json({ ok: false, message: "Sign in required." }, 401, request);
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return json({ ok: false, message: "Choose an image file." }, 400, request);
  if (file.size > AVATAR_MAX_BYTES) return json({ ok: false, message: "Image is too large (max 512 KB)." }, 413, request);
  const bytes = Buffer.from(await file.arrayBuffer());
  const image = sniffImage(bytes);
  if (!image) return json({ ok: false, message: "Use a JPG, PNG or WebP image." }, 415, request);
  if (image.width > AVATAR_MAX_SIDE || image.height > AVATAR_MAX_SIDE) {
    return json({ ok: false, message: `Image must be at most ${AVATAR_MAX_SIDE}px per side.` }, 413, request);
  }
  const result = await store.saveAvatar(user.id, bytes, image.extension);
  if (!result.ok) return json(result, 400, request);
  return json({ ok: true, ...(await store.bootstrap(user.id)) }, 200, request);
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if (!user) return json({ ok: false, message: "Sign in required." }, 401, request);
  const result = await store.removeAvatar(user.id);
  if (!result.ok) return json(result, 400, request);
  return json({ ok: true, ...(await store.bootstrap(user.id)) }, 200, request);
}

export async function GET() {
  if (DATA_MODE !== "alpha") return new Response("Not found", { status: 404 });
  const user = await requireUser();
  if (!user) return new Response("Sign in required.", { status: 401 });
  const file = avatarFile(user.id);
  if (!file) return new Response("Not found", { status: 404 });
  const bytes = readFileSync(file.path);
  return new Response(new Uint8Array(bytes), {
    status: 200,
    // The URL carries ?v=<timestamp>, so the browser may cache each version.
    headers: { "content-type": file.contentType, "cache-control": "private, max-age=31536000, immutable", "content-length": String(bytes.length) },
  });
}
