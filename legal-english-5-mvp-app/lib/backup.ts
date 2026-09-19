import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import type { ZipEntry } from "./zip";

/** Every public table created by supabase/migrations/001–012. */
export const PUBLIC_TABLES = [
  "users",
  "terms",
  "quiz_items",
  "user_term_progress",
  "subscriptions",
  "support_tickets",
  "import_runs",
  "billing_events",
  "insights",
  "study_days",
  "quiz_attempts",
  "quiz_sessions",
] as const;

export const CONTENT_BUCKETS = ["term-audio", "avatars"] as const;
export const BACKUP_ARCHIVE_BUCKET = "app-backups";
/** Vercel hobby/pro response body stays under this; larger archives use a signed URL. */
export const DIRECT_DOWNLOAD_LIMIT = 4 * 1024 * 1024;

export type TableDump = { rows: unknown[]; error?: string };

export type BackupManifest = {
  app: "legal-english-5";
  kind: "complete";
  exportedAt: string;
  mode: "production" | "alpha";
  tables: Record<string, { rows: number; error?: string }>;
  storage: Record<string, { files: number; error?: string }>;
  authUsers?: number;
  note: string;
};

export function backupFilename(at = new Date()) {
  const stamp = at.toISOString().slice(0, 19).replace(/:/g, "");
  return `legal-english-5-backup-${stamp}Z.zip`;
}

export function jsonEntry(name: string, value: unknown): ZipEntry {
  return { name, data: Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8") };
}

export function migrationDir(root = process.cwd()) {
  return join(root, "supabase", "migrations");
}

export function migrationFiles(root = process.cwd()): { filename: string; data: Buffer }[] {
  const dir = migrationDir(root);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((filename) => ({ filename, data: readFileSync(join(dir, filename)) }));
}

export function concatenatedMigrations(files: { filename: string; data: Buffer }[]) {
  return files
    .map((file) => `-- ${file.filename}\n${file.data.toString("utf8").replace(/\s+$/, "")}\n`)
    .join("\n");
}

export function walkDirectory(absRoot: string, zipPrefix: string): ZipEntry[] {
  if (!existsSync(absRoot)) return [];
  const out: ZipEntry[] = [];
  const visit = (dir: string, rel: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const next = rel ? `${rel}/${name}` : name;
      if (statSync(full).isDirectory()) visit(full, next);
      else out.push({ name: `${zipPrefix}/${next}`, data: readFileSync(full) });
    }
  };
  visit(absRoot, "");
  return out;
}

export function backupReadme(manifest: BackupManifest) {
  return [
    "LEGAL ENGLISH 5 — COMPLETE BACKUP",
    "=================================",
    "",
    `Created: ${manifest.exportedAt}`,
    `Mode: ${manifest.mode}`,
    "",
    "This archive is produced from the Owner console. You do not open the Supabase dashboard.",
    "",
    "CONTENTS",
    "--------",
    "manifest.json                 Inventory and row/file counts",
    "README.txt                    This file",
    "schema/migrations/            Every SQL migration (tables, RLS, Storage policies, grants)",
    "schema/rls-and-schema.sql     The same migrations concatenated, in order",
    "database/<table>.json         Full row dump of each public table",
    "auth/users.json               Auth account metadata (production only; password hashes are not exported)",
    "storage/buckets.json          Bucket settings (production only)",
    "storage/term-audio/           Pronunciation recordings",
    "storage/avatars/              Profile photos",
    "",
    "RLS",
    "---",
    "Row Level Security and Storage policies are the SQL in schema/. That is the configuration",
    "that was shipped with the app (migrations 001–012). Applying those files recreates the",
    "tables, policies, and buckets without using the Supabase UI.",
    "",
    "PASSWORDS",
    "---------",
    "Supabase Auth does not expose password hashes. After a project rebuild, learners keep",
    "their accounts only if Auth is restored from a Supabase-side backup; otherwise they use",
    "Forgot password. The public.users rows (email, role, consents, progress links) are here.",
    "",
    "NOT IN THIS FILE",
    "----------------",
    "Vercel project settings, Mercado Pago credentials, and DNS/MX. Those stay with the Owner.",
    "",
    JSON.stringify(
      {
        tables: manifest.tables,
        storage: manifest.storage,
        authUsers: manifest.authUsers ?? 0,
      },
      null,
      2
    ),
    "",
  ].join("\n");
}

export function buildBackupEntries(input: {
  manifest: BackupManifest;
  tables: Record<string, TableDump>;
  authUsers?: unknown;
  buckets?: unknown;
  files: ZipEntry[];
}): ZipEntry[] {
  const migrations = migrationFiles();
  const entries: ZipEntry[] = [
    jsonEntry("manifest.json", input.manifest),
    { name: "README.txt", data: Buffer.from(backupReadme(input.manifest), "utf8") },
    { name: "schema/rls-and-schema.sql", data: Buffer.from(concatenatedMigrations(migrations), "utf8") },
    ...migrations.map((file) => ({ name: `schema/migrations/${file.filename}`, data: file.data })),
  ];
  for (const [table, dump] of Object.entries(input.tables)) {
    entries.push(jsonEntry(`database/${table}.json`, dump));
  }
  if (input.authUsers !== undefined) entries.push(jsonEntry("auth/users.json", input.authUsers));
  if (input.buckets !== undefined) entries.push(jsonEntry("storage/buckets.json", input.buckets));
  entries.push(...input.files);
  return entries;
}

export function tableSummary(tables: Record<string, TableDump>): BackupManifest["tables"] {
  return Object.fromEntries(Object.entries(tables).map(([name, dump]) => [name, { rows: dump.rows.length, error: dump.error }]));
}
