import { requireUser } from "@/lib/api";
import { store } from "@/lib/data-store";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireUser();
  if (user?.role !== "admin") {
    return new Response(JSON.stringify({ ok: false, message: "Owner access required." }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
  const result = await store.exportSnapshot(user.id);
  if (!result.ok) {
    return new Response(JSON.stringify(result), { status: 400, headers: { "content-type": "application/json" } });
  }
  const filename = `legal-english-5-export-${new Date().toISOString().slice(0, 10)}.json`;
  return new Response(JSON.stringify(result.snapshot, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
