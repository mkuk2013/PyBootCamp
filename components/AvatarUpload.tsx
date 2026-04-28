"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2, User as UserIcon } from "lucide-react";
import { toast } from "react-hot-toast";

type Props = {
  value: string | null; // current image data URL or remote URL
  onChange: (dataUrl: string | null) => void;
  name?: string; // for fallback initials
  size?: number; // px (rendered square)
  disabled?: boolean;
};

const MAX_INPUT_BYTES = 8 * 1024 * 1024; // refuse files > 8MB before resize
const TARGET_SIZE = 256; // square output
const JPEG_QUALITY = 0.85;

/**
 * Avatar picker:
 *  - lets the user select a local image (or drag and drop),
 *  - resizes & center-crops it to a 256x256 JPEG client-side via <canvas>,
 *  - calls onChange(dataUrl) so the parent can persist it.
 *
 * Output is small (~30-60KB) so it can be sent inline as a base64 data URL.
 */
export default function AvatarUpload({
  value,
  onChange,
  name = "",
  size = 96,
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const initials = (name || "")
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      toast.error("Image too large. Max 8MB.");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await resizeToSquareDataUrl(file, TARGET_SIZE, JPEG_QUALITY);
      onChange(dataUrl);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to process image");
    } finally {
      setBusy(false);
    }
  }

  function onPick() {
    if (disabled || busy) return;
    inputRef.current?.click();
  }

  function onRemove() {
    if (disabled || busy) return;
    onChange(null);
  }

  return (
    <div
      className="flex items-center gap-4"
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        handleFile(file);
      }}
    >
      <button
        type="button"
        onClick={onPick}
        disabled={disabled || busy}
        title="Click to choose a photo, or drag one here"
        style={{ width: size, height: size }}
        className={`group relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition ${
          dragging
            ? "border-brand-500 ring-4 ring-brand-100 dark:ring-brand-900/40"
            : "border-slate-300 hover:border-brand-400 dark:border-slate-700 dark:hover:border-brand-500"
        } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        {value ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={value}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : initials ? (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500 to-py-400 text-xl font-black text-white">
            {initials}
          </span>
        ) : (
          <UserIcon className="h-1/2 w-1/2 text-slate-400" />
        )}
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/60 py-1 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 transition group-hover:opacity-100">
          {busy ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <Camera className="h-3 w-3" /> Change
            </>
          )}
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
          Profile picture
        </p>
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
          Click the avatar to upload, or drag &amp; drop. Max 8MB. Auto-resized
          to 256×256.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onPick}
            disabled={disabled || busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-brand-400 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-500"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
            {value ? "Change photo" : "Upload photo"}
          </button>
          {value && (
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled || busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-900/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          handleFile(file);
          // reset so the same file can be picked again
          e.target.value = "";
        }}
      />
    </div>
  );
}

/**
 * Loads `file` into an HTMLImageElement, draws a center-cropped square
 * onto a `size`x`size` canvas, and returns a JPEG data URL.
 */
async function resizeToSquareDataUrl(
  file: File,
  size: number,
  quality: number
): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    // Center-crop to square first
    const minDim = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - minDim) / 2;
    const sy = (img.naturalHeight - minDim) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}
