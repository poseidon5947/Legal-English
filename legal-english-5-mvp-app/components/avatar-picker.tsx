"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/components/app-provider";
import { Avatar } from "@/components/avatar";
import { useLocale } from "@/components/locale-provider";
import { learnerText, type LearnerKey } from "@/lib/learner-copy";

const OUTPUT_SIDE = 256;
const INPUT_MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

/**
 * Centre-crops the chosen picture to a square and downsizes it to 256 px in
 * the browser, so a 12 MP phone photo becomes a ~10 KB WebP before it ever
 * leaves the device. Falls back to JPEG on browsers without WebP encoding.
 */
async function prepare(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - side) / 2;
    const sy = (bitmap.height - side) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIDE;
    canvas.height = OUTPUT_SIDE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, OUTPUT_SIDE, OUTPUT_SIDE);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
    if (blob && blob.type === "image/webp") return blob;
    const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
    if (!jpeg) throw new Error("encode");
    return jpeg;
  } finally {
    bitmap.close();
  }
}

export function AvatarPicker({ name, src }: { name: string; src?: string | null }) {
  const { uploadAvatar, removeAvatar } = useApp();
  const { locale } = useLocale();
  const L = (key: LearnerKey, vars?: Record<string, string | number>) => learnerText(locale, key, vars);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!pending) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(pending);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pending]);

  async function choose(file: File | undefined) {
    setMessage("");
    if (!file) return;
    if (!ACCEPT.includes(file.type)) {
      setMessage(L("photoNotImage"));
      return;
    }
    if (file.size > INPUT_MAX_BYTES) {
      setMessage(L("photoTooLarge"));
      return;
    }
    try {
      setPending(await prepare(file));
    } catch {
      setMessage(L("photoNotImage"));
    }
  }

  async function save() {
    if (!pending) return;
    setBusy(true);
    const result = await uploadAvatar(pending);
    setBusy(false);
    if (result.ok) setPending(null);
    else setMessage(result.message || L("photoFailed"));
  }

  async function remove() {
    setBusy(true);
    setMessage("");
    const result = await removeAvatar();
    setBusy(false);
    if (!result.ok) setMessage(result.message || L("photoFailed"));
  }

  function discard() {
    setPending(null);
    setMessage("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="avatar-picker">
      <div className="account-ref-avatar-wrap">
        {preview ? (
          <img className="learner-avatar large photo" src={preview} alt={L("photoOf", { name })} />
        ) : (
          <Avatar name={name} src={src} size="large" alt={L("photoOf", { name })} />
        )}
        <button type="button" onClick={() => inputRef.current?.click()} aria-label={src ? L("photoChange") : L("photoAdd")} title={src ? L("photoChange") : L("photoAdd")} disabled={busy}>
          <img className="account-ref-icon" src="/account-assets/icons/edit-pencil.png" alt="" aria-hidden="true" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          hidden
          onChange={(event) => void choose(event.target.files?.[0])}
        />
      </div>
      <div className="avatar-picker-actions">
        {pending ? (
          <>
            <button type="button" className="primary inline" onClick={() => void save()} disabled={busy}>
              {L("photoSave")}
            </button>
            <button type="button" className="ghost inline" onClick={discard} disabled={busy}>
              {L("photoCancel")}
            </button>
          </>
        ) : (
          <>
            <button type="button" className="ghost inline" onClick={() => inputRef.current?.click()} disabled={busy}>
              {src ? L("photoChange") : L("photoAdd")}
            </button>
            {src && (
              <button type="button" className="ghost inline danger" onClick={() => void remove()} disabled={busy}>
                {L("photoRemove")}
              </button>
            )}
          </>
        )}
        <small>{message || L("photoHint")}</small>
      </div>
    </div>
  );
}
