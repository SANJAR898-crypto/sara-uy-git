import { v2 as cloudinary } from "cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const cloudinaryConfigured =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

export interface UploadResult {
  url: string;
  width?: number;
  height?: number;
}

export async function uploadImageFile(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Faqat JPEG, PNG, WEBP yoki AVIF rasm formatlariga ruxsat berilgan");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("Rasm hajmi 8MB dan oshmasligi kerak");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (cloudinaryConfigured) {
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    const uploaded = await cloudinary.uploader.upload(base64, {
      folder: "sara-uylar/listings",
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
    return { url: uploaded.secure_url, width: uploaded.width, height: uploaded.height };
  }

  // Local disk fallback for environments without Cloudinary configured.
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const ext = file.type.split("/")[1] ?? "jpg";
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(uploadsDir, filename), buffer);
  return { url: `/uploads/${filename}` };
}

export function isCloudinaryConfigured(): boolean {
  return cloudinaryConfigured;
}
