import { json, requireUser } from "@/lib/api";
import { store } from "@/lib/data-store";
import { previewWorkbook } from "@/lib/import-mcd";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireUser();
  if (user?.role !== "admin") return json({ ok: false, message: "Owner access required." }, 403);
  return json({ ok: true, metrics: await store.metrics() });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (user?.role !== "admin") return json({ ok: false, message: "Owner access required." }, 403);
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return json({ ok: false, message: "Upload an Excel file." }, 400);
    const bootstrapData = await store.bootstrap(user.id);
    const preview = previewWorkbook(Buffer.from(await file.arrayBuffer()), bootstrapData.terms);
    return json({ ok: preview.canCommit, preview });
  }
  const body = await request.json();
  if (body.action === "save-term") return json(await store.saveTerm(user.id, body.term));
  if (body.action === "publish") return json(await store.setPublished(user.id, body.termId, body.published));
  if (body.action === "archive") return json(await store.setArchived(user.id, body.termId, body.archived));
  if (body.action === "delete-term") return json(await store.deleteTerm(user.id, body.termId));
  if (body.action === "grant") return json(await store.grantAccess(user.id, body.userId));
  if (body.action === "commit-import") return json(await store.replaceTerms(user.id, body.terms));
  if (body.action === "rollback-import") return json(await store.rollbackImportRun(user.id, body.importRunId));
  return json({ ok: false, message: "Unknown admin action." }, 400);
}
