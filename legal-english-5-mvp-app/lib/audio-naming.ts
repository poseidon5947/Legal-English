// Audio filename convention (Delivery Mapping control C-01, proposed by the
// contractor for the Owner's approval before Hito B):
//
//   {TermID}_US.{ext}   e.g. CON-001_US.mp3
//   {TermID}_UK.{ext}   e.g. EMP-009_UK.mp3
//
// TermID is the canonical MCD id, upper-case, exactly as in the workbook.
// Jurisdiction suffix is US or UK. Allowed containers: mp3, m4a, wav, ogg.
// One file per Term and jurisdiction; uploading the same name again replaces
// the previous asset. Anything else is rejected with a reason, never guessed.

export type AudioJurisdiction = "us" | "uk";
export const AUDIO_EXTENSIONS = ["mp3", "m4a", "wav", "ogg"] as const;
export const AUDIO_MIME: Record<(typeof AUDIO_EXTENSIONS)[number], string> = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  wav: "audio/wav",
  ogg: "audio/ogg",
};

const PATTERN = /^([A-Z]{2,6}-\d{3})_(US|UK)\.([A-Za-z0-9]+)$/;

export type ParsedAudioName =
  | { ok: true; termId: string; jurisdiction: AudioJurisdiction; extension: (typeof AUDIO_EXTENSIONS)[number] }
  | { ok: false; reason: string };

export function parseAudioFilename(filename: string): ParsedAudioName {
  const base = filename.split(/[\\/]/).pop() ?? filename;
  const match = PATTERN.exec(base.trim());
  if (!match) return { ok: false, reason: `"${base}" does not follow {TermID}_US|UK.{ext} (example: CON-001_US.mp3).` };
  const extension = match[3].toLowerCase();
  if (!(AUDIO_EXTENSIONS as readonly string[]).includes(extension)) {
    return { ok: false, reason: `"${base}" uses .${extension}; allowed: ${AUDIO_EXTENSIONS.join(", ")}.` };
  }
  return { ok: true, termId: match[1], jurisdiction: match[2].toLowerCase() as AudioJurisdiction, extension: extension as (typeof AUDIO_EXTENSIONS)[number] };
}

export function extensionOf(filename: string) {
  const extension = (filename.split(".").pop() || "").toLowerCase();
  return (AUDIO_EXTENSIONS as readonly string[]).includes(extension) ? (extension as (typeof AUDIO_EXTENSIONS)[number]) : null;
}

export function canonicalAudioName(termId: string, jurisdiction: AudioJurisdiction, extension: string) {
  return `${termId}_${jurisdiction.toUpperCase()}.${extension}`;
}

// Object path inside the storage bucket / alpha data folder.
export function storagePathFor(termId: string, jurisdiction: AudioJurisdiction, extension: string) {
  return `${termId}/${jurisdiction}.${extension}`;
}
