import { requireUser } from "@/lib/api";
import { DIRECT_DOWNLOAD_LIMIT } from "@/lib/backup";
import { DATA_MODE, store } from "@/lib/data-store";
import { storeBackupArchive } from "@/lib/store.supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const user = await requireUser();
  if (user?.role !== "admin") {
    return new Response(JSON.stringify({ ok: false, message: "Owner access required." }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
  const result = await store.exportFullBackup(user.id);
  if (!result.ok) {
    return new Response(JSON.stringify(result), { status: 400, headers: { "content-type": "application/json" } });
  }

  let signedUrl: string | null = null;
  if (DATA_MODE === "production") {
    try {
      signedUrl = await storeBackupArchive(result.zip, result.filename);
    } catch (error) {
      if (result.zip.length > DIRECT_DOWNLOAD_LIMIT) {
        const message = error instanceof Error ? error.message : "The backup is too large to download directly.";
        return new Response(JSON.stringify({ ok: false, message }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }
    }
  }

  if (signedUrl && result.zip.length > DIRECT_DOWNLOAD_LIMIT) {
    return new Response(JSON.stringify({ ok: true, url: signedUrl, filename: result.filename }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(new Uint8Array(result.zip), {
    status: 200,
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${result.filename}"`,
      "content-length": String(result.zip.length),
    },
  });
}
