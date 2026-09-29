"use server";

import { requireAdmin } from "@/lib/auth";
import { assetUrl, uploadAsset } from "@/lib/storage";

export type UploadResult = { path: string; url: string } | { error: string };

/**
 * Uploads one admin asset (image or audio) to the public assets bucket.
 * Called as soon as a file is picked, so each request carries one file and
 * stays under Vercel's 4.5 MB body limit.
 */
export async function uploadAssetAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "misc").replace(/[^a-z0-9-]/gi, "") || "misc";
  if (!(file instanceof File) || file.size === 0) return { error: "No file" };
  try {
    const path = await uploadAsset(file, folder);
    return { path, url: assetUrl(path)! };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}
