"use client";

import { AnimatePresence, motion, Reorder } from "framer-motion";
import { Camera, GripVertical, ImagePlus, RotateCw, Star, Trash2, TriangleAlert, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/providers";

interface PendingUpload {
  localId: string;
  progress: number;
  error?: boolean;
}

const MAX_IMAGES = 25;
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

/** Resizes + compresses an image client-side (no storage backend required —
 * the resulting data URL is stored directly in the listing's `images` array). */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas unsupported"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function rotateImage(dataUrl: string, degrees: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error("decode failed"));
    img.onload = () => {
      const swap = degrees % 180 !== 0;
      const canvas = document.createElement("canvas");
      canvas.width = swap ? img.height : img.width;
      canvas.height = swap ? img.width : img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas unsupported"));
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };
    img.src = dataUrl;
  });
}

/**
 * Professional Media Center — drag & drop / gallery / camera upload, client
 * side compression, reordering, rotate and per-image delete + retry. Built
 * without any external storage dependency: images are stored as compressed
 * data URLs directly on the listing (fine for MVP scale; swap for S3/Cloud
 * storage URLs later without changing this component's public API).
 */
export function MediaCenter({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const { showToast } = useToast();
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const failedFilesRef = useRef<Map<string, File>>(new Map());

  const processFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) {
        showToast(`Ko'pi bilan ${MAX_IMAGES} ta rasm yuklash mumkin`, "error");
        return;
      }
      const list = Array.from(files).slice(0, remaining);

      for (const file of list) {
        if (!file.type.startsWith("image/")) continue;
        const localId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setPending((p) => [...p, { localId, progress: 10 }]);

        try {
          setPending((p) => p.map((u) => (u.localId === localId ? { ...u, progress: 55 } : u)));
          const compressed = await compressImage(file);
          setPending((p) => p.map((u) => (u.localId === localId ? { ...u, progress: 100 } : u)));
          onChange([...images, compressed]);
          setTimeout(() => setPending((p) => p.filter((u) => u.localId !== localId)), 400);
        } catch {
          failedFilesRef.current.set(localId, file);
          setPending((p) => p.map((u) => (u.localId === localId ? { ...u, error: true } : u)));
        }
      }
    },
    [images, onChange, showToast]
  );

  const retry = useCallback(
    async (localId: string) => {
      const file = failedFilesRef.current.get(localId);
      if (!file) return;
      setPending((p) => p.map((u) => (u.localId === localId ? { ...u, error: false, progress: 30 } : u)));
      try {
        const compressed = await compressImage(file);
        onChange([...images, compressed]);
        setPending((p) => p.filter((u) => u.localId !== localId));
        failedFilesRef.current.delete(localId);
      } catch {
        setPending((p) => p.map((u) => (u.localId === localId ? { ...u, error: true } : u)));
      }
    },
    [images, onChange]
  );

  const removeAt = (index: number) => onChange(images.filter((_, i) => i !== index));

  const rotateAt = async (index: number) => {
    try {
      const rotated = await rotateImage(images[index], 90);
      const next = [...images];
      next[index] = rotated;
      onChange(next);
    } catch {
      showToast("Rasmni aylantirib bo'lmadi", "error");
    }
  };

  const makeCover = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          processFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed p-6 text-center transition-colors",
          dragOver ? "border-brand-400 bg-brand-50" : "border-border bg-surface-2"
        )}
      >
        <ImagePlus className="h-7 w-7 text-brand-400" />
        <p className="text-[13px] font-semibold text-ink-900">Rasmlarni shu yerga torting</p>
        <p className="text-[11.5px] text-ink-700/50">yoki quyidagi tugmalardan birini tanlang ({images.length}/{MAX_IMAGES})</p>
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-[12.5px] font-bold text-white"
          >
            <Upload className="h-3.5 w-3.5" /> Galereya
          </button>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-[12.5px] font-bold text-ink-800"
          >
            <Camera className="h-3.5 w-3.5" /> Kamera
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            processFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            processFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <AnimatePresence>
        {pending.map((u) => (
          <motion.div
            key={u.localId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-[var(--radius-sm)] border border-border bg-white p-2.5"
          >
            {u.error ? (
              <div className="flex items-center justify-between gap-2 text-[12px] text-error">
                <span className="flex items-center gap-1.5">
                  <TriangleAlert className="h-3.5 w-3.5" /> Yuklashda xatolik
                </span>
                <button onClick={() => retry(u.localId)} className="rounded-full bg-error-bg px-2.5 py-1 font-bold">
                  Qayta urinish
                </button>
              </div>
            ) : (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-brand-500"
                  animate={{ width: `${u.progress}%` }}
                  transition={{ duration: 0.25 }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {images.length > 0 && (
        <Reorder.Group axis="y" values={images} onReorder={onChange} className="space-y-2">
          {images.map((img, index) => (
            <Reorder.Item key={img} value={img} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-white p-2">
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-ink-700/30" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Rasm ${index + 1}`} className="h-14 w-14 shrink-0 rounded-[var(--radius-sm)] object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-ink-900">Rasm {index + 1}</p>
                {index === 0 && (
                  <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600">
                    <Star className="h-2.5 w-2.5 fill-brand-500" /> Muqova
                  </span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => makeCover(index)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink-700/50 hover:bg-black/[0.04]"
                    title="Muqova qilish"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => rotateAt(index)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-700/50 hover:bg-black/[0.04]"
                  title="Aylantirish"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-error hover:bg-error-bg"
                  title="O'chirish"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  );
}
