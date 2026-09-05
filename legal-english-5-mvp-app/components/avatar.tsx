"use client";

import { useEffect, useState } from "react";

export function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type Props = {
  name: string;
  /** Photo URL from the session (`user.avatarUrl`); null/undefined falls back to initials. */
  src?: string | null;
  size?: "default" | "large";
  className?: string;
  /** Accessible label; omit to render decoratively (parent already names the control). */
  alt?: string;
};

/**
 * Profile avatar: the learner's uploaded photo when there is one, their
 * initials otherwise. If the photo fails to load (expired signed URL, file
 * removed on disk) it degrades to initials instead of a broken image icon.
 */
export function Avatar({ name, src, size = "default", className = "", alt }: Props) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  const classes = ["learner-avatar", size === "large" ? "large" : "", className].filter(Boolean).join(" ");
  if (src && !broken) {
    return (
      <img
        className={`${classes} photo`}
        src={src}
        alt={alt ?? ""}
        aria-hidden={alt ? undefined : true}
        decoding="async"
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <i className={classes} aria-hidden={alt ? undefined : true} aria-label={alt} role={alt ? "img" : undefined}>
      {initialsOf(name)}
    </i>
  );
}
