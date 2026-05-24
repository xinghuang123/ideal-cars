"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { HeroSlideRow } from "@/types/database";
import {
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlide,
} from "./hero-slide-actions";

const BUCKET = "site-images";

export default function HeroSlidesManager({
  initialSlides,
}: {
  initialSlides: HeroSlideRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function refresh() {
    router.refresh();
  }

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      const res = await createHeroSlide();
      if (res.error) setError(res.error);
      refresh();
    });
  }

  function handleDelete(slide: HeroSlideRow) {
    if (!confirm("Delete this slide?")) return;
    setError(null);
    setBusyId(slide.id);
    startTransition(async () => {
      const res = await deleteHeroSlide(slide.id);
      setBusyId(null);
      if (res.error) setError(res.error);
      refresh();
    });
  }

  function handleReorder(slide: HeroSlideRow, direction: "up" | "down") {
    setError(null);
    setBusyId(slide.id);
    startTransition(async () => {
      const res = await reorderHeroSlide(slide.id, direction);
      setBusyId(null);
      if (res.error) setError(res.error);
      refresh();
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-silver bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-navy">
            Homepage Hero Slideshow
          </h2>
          <p className="mt-1 text-xs text-silver-dark">
            Slides shown on the homepage carousel. Drag-style reorder with the
            arrows, hide a slide by toggling Active off. Upload a JPG/PNG/WebP
            for each slide — if no image is set, the gradient fallback is used.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={pending}
        >
          + Add Slide
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {initialSlides.length === 0 ? (
        <p className="rounded-lg border border-silver bg-gray-50 p-8 text-center text-sm text-silver-dark">
          No slides yet. Click &ldquo;Add Slide&rdquo; to create one.
        </p>
      ) : (
        <ul className="space-y-3">
          {initialSlides.map((slide, idx) => (
            <SlideRow
              key={slide.id}
              slide={slide}
              index={idx}
              total={initialSlides.length}
              busy={pending && busyId === slide.id}
              onDelete={() => handleDelete(slide)}
              onMoveUp={() => handleReorder(slide, "up")}
              onMoveDown={() => handleReorder(slide, "down")}
              onSaved={refresh}
              onError={setError}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface SlideRowProps {
  slide: HeroSlideRow;
  index: number;
  total: number;
  busy: boolean;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSaved: () => void;
  onError: (msg: string | null) => void;
}

function SlideRow({
  slide,
  index,
  total,
  busy,
  onDelete,
  onMoveUp,
  onMoveDown,
  onSaved,
  onError,
}: SlideRowProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(slide.image_url);
  const [heading, setHeading] = useState(slide.heading);
  const [subheading, setSubheading] = useState(slide.subheading);
  const [buttonText, setButtonText] = useState(slide.button_text);
  const [buttonHref, setButtonHref] = useState(slide.button_href);
  const [isActive, setIsActive] = useState(slide.is_active);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `hero-slides/${slide.id}-${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

      setImageUrl(urlData.publicUrl);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleRemoveImage() {
    if (!imageUrl) return;
    if (!confirm("Remove the image from this slide?")) return;
    onError(null);

    try {
      const supabase = createClient();
      const path = extractPath(imageUrl);
      if (path) {
        await supabase.storage.from(BUCKET).remove([path]);
      }
      setImageUrl(null);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to remove image");
    }
  }

  async function handleSave() {
    onError(null);
    setSaving(true);
    const res = await updateHeroSlide(slide.id, {
      image_url: imageUrl,
      heading,
      subheading,
      button_text: buttonText,
      button_href: buttonHref,
      gradient_class: slide.gradient_class,
      is_active: isActive,
    });
    setSaving(false);
    if (res.error) {
      onError(res.error);
      return;
    }
    setSavedAt(Date.now());
    onSaved();
  }

  const showSavedFlash = savedAt !== null && Date.now() - savedAt < 2500;

  return (
    <li className="rounded-lg border border-silver bg-gray-50 p-4">
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Image preview + upload */}
        <div className="md:w-56 md:shrink-0">
          <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-silver bg-white">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 220px"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-2 text-center text-xs text-silver-dark">
                No image — gradient will show
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <label className="flex-1 cursor-pointer rounded-md border border-silver bg-white px-3 py-1.5 text-center text-xs font-medium text-navy hover:border-accent hover:text-accent">
              {uploading ? "Uploading..." : imageUrl ? "Replace" : "Upload"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
            {imageUrl && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="rounded-md border border-silver bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:border-red-300 hover:bg-red-50"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Editable fields */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-silver-dark">
              Slide {index + 1}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onMoveUp}
                disabled={busy || index === 0}
                className="rounded-md border border-silver bg-white px-2 py-1 text-xs text-navy hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                disabled={busy || index === total - 1}
                className="rounded-md border border-silver bg-white px-2 py-1 text-xs text-navy hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Move down"
              >
                ↓
              </button>
              <label className="flex items-center gap-1.5 text-xs text-navy">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-silver text-accent focus:ring-accent/30"
                />
                Active
              </label>
              <button
                type="button"
                onClick={onDelete}
                disabled={busy}
                className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
            />
            <Input
              label="Subheading"
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
            />
            <Input
              label="Button text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="e.g. Browse Cars"
            />
            <Input
              label="Button link"
              value={buttonHref}
              onChange={(e) => setButtonHref(e.target.value)}
              placeholder="e.g. /buy"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            {showSavedFlash && (
              <span className="text-xs text-green-700">Saved.</span>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save slide"}
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}

function extractPath(publicUrl: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const i = publicUrl.indexOf(marker);
  if (i === -1) return null;
  return publicUrl.slice(i + marker.length);
}
