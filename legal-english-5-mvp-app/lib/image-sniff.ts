// Tiny header parser for the three raster formats the profile-photo upload
// accepts. It exists so the server never trusts the client's file name or
// Content-Type: the bytes must actually be a WebP/JPEG/PNG of a sane size.

export type SniffedImage = { extension: "webp" | "jpg" | "png"; width: number; height: number };

function pngSize(b: Buffer): SniffedImage | null {
  if (b.length < 24 || b.toString("ascii", 12, 16) !== "IHDR") return null;
  return { extension: "png", width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

function jpegSize(b: Buffer): SniffedImage | null {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null;
    const marker = b[i + 1];
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      i += 2;
      continue;
    }
    const length = b.readUInt16BE(i + 2);
    // SOF0..SOF15 except DHT (C4), JPG (C8), DAC (CC)
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { extension: "jpg", width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
    }
    i += 2 + length;
  }
  return null;
}

function webpSize(b: Buffer): SniffedImage | null {
  if (b.length < 30) return null;
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8 ") {
    return { extension: "webp", width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { extension: "webp", width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") {
    const width = 1 + (b[24] | (b[25] << 8) | (b[26] << 16));
    const height = 1 + (b[27] | (b[28] << 8) | (b[29] << 16));
    return { extension: "webp", width, height };
  }
  return null;
}

/** Returns the real format and pixel size, or null when the bytes are not a WebP/JPEG/PNG. */
export function sniffImage(bytes: Buffer): SniffedImage | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0x89 && bytes.toString("ascii", 1, 4) === "PNG") return pngSize(bytes);
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return jpegSize(bytes);
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return webpSize(bytes);
  return null;
}
