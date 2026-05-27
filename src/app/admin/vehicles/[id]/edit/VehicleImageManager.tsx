"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { VehicleImageRow } from "@/types/database";

const BUCKET = "vehicle-images";

export default function VehicleImageManager({
  vehicleId,
  initialImages,
}: {
  vehicleId: string;
  initialImages: VehicleImageRow[];
}) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    const supabase = createClient();

    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${vehicleId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(path);

        const isPrimary = images.length === 0;
        const { data: row, error: insertError } = await supabase
          .from("vehicle_images")
          .insert({
            vehicle_id: vehicleId,
            image_url: urlData.publicUrl,
            display_order: images.length,
            is_primary: isPrimary,
          })
          .select()
          .single();
        if (insertError) throw insertError;

        setImages((prev) => [...prev, row as VehicleImageRow]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
      router.refresh();
    }
  }

  function handleDelete(image: VehicleImageRow) {
    if (!confirm("Delete this image?")) return;
    startTransition(async () => {
      setError(null);
      const supabase = createClient();

      const path = extractPath(image.image_url);
      if (path) {
        await supabase.storage.from(BUCKET).remove([path]);
      }

      const { error: dbError } = await supabase
        .from("vehicle_images")
        .delete()
        .eq("id", image.id);

      if (dbError) {
        setError(dbError.message);
        return;
      }

      const remaining = images.filter((i) => i.id !== image.id);
      // If we deleted the primary, promote the first remaining image
      if (image.is_primary && remaining.length > 0) {
        await supabase
          .from("vehicle_images")
          .update({ is_primary: true })
          .eq("id", remaining[0].id);
        remaining[0] = { ...remaining[0], is_primary: true };
      }
      setImages(remaining);
      router.refresh();
    });
  }

  function handleSetPrimary(image: VehicleImageRow) {
    if (image.is_primary) return;
    startTransition(async () => {
      setError(null);
      const supabase = createClient();

      const { error: clearError } = await supabase
        .from("vehicle_images")
        .update({ is_primary: false })
        .eq("vehicle_id", vehicleId);
      if (clearError) {
        setError(clearError.message);
        return;
      }

      const { error: setError2 } = await supabase
        .from("vehicle_images")
        .update({ is_primary: true })
        .eq("id", image.id);
      if (setError2) {
        setError(setError2.message);
        return;
      }

      setImages((prev) =>
        prev.map((i) => ({ ...i, is_primary: i.id === image.id })),
      );
      router.refresh();
    });
  }

  // Defensive: if legacy data has multiple rows flagged primary, pick a single
  // effective primary (lowest display_order, then earliest created_at) and
  // treat the rest as non-primary in the UI. The "Set as primary" handler
  // re-normalises the DB next time the admin clicks it.
  const effectivePrimaryId = [...images]
    .filter((i) => i.is_primary)
    .sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return (a.created_at ?? "").localeCompare(b.created_at ?? "");
    })[0]?.id;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-lg border-2 border-dashed border-silver bg-gray-50 px-4 py-2 text-sm font-medium text-navy hover:border-accent hover:text-accent">
          {uploading ? "Uploading..." : "+ Upload Images"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        <p className="text-xs text-silver-dark">
          JPG, PNG, or WebP · max 10 MB each
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {images.length === 0 ? (
        <p className="rounded-lg border border-silver bg-gray-50 p-8 text-center text-sm text-silver-dark">
          No images yet.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => {
            const isPrimary = img.id === effectivePrimaryId;
            return (
            <li
              key={img.id}
              className="relative overflow-hidden rounded-lg border border-silver bg-white"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                <Image
                  src={img.image_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                {isPrimary && (
                  <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">
                    Primary
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-2 text-xs">
                {isPrimary ? (
                  <span className="text-silver-dark">Primary image</span>
                ) : (
                  <button
                    onClick={() => handleSetPrimary(img)}
                    disabled={pending}
                    className="font-medium text-accent hover:text-accent-dark disabled:opacity-50"
                  >
                    Set as primary
                  </button>
                )}
                <button
                  onClick={() => handleDelete(img)}
                  disabled={pending}
                  className="font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function extractPath(publicUrl: string): string | null {
  // public URL format: https://<project>.supabase.co/storage/v1/object/public/vehicle-images/<path>
  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}
