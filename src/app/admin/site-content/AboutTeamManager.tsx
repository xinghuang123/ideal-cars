"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import type { AboutTeamMemberRow } from "@/types/database";
import {
  createAboutTeamMember,
  updateAboutTeamMember,
  deleteAboutTeamMember,
  reorderAboutTeamMember,
} from "./about-team-actions";

const BUCKET = "site-images";

export default function AboutTeamManager({
  initialMembers,
}: {
  initialMembers: AboutTeamMemberRow[];
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
      const res = await createAboutTeamMember();
      if (res.error) setError(res.error);
      refresh();
    });
  }

  function handleDelete(member: AboutTeamMemberRow) {
    if (!confirm("Delete this team member?")) return;
    setError(null);
    setBusyId(member.id);
    startTransition(async () => {
      const res = await deleteAboutTeamMember(member.id);
      setBusyId(null);
      if (res.error) setError(res.error);
      refresh();
    });
  }

  function handleReorder(member: AboutTeamMemberRow, direction: "up" | "down") {
    setError(null);
    setBusyId(member.id);
    startTransition(async () => {
      const res = await reorderAboutTeamMember(member.id, direction);
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
            About page — Meet Our Team
          </h2>
          <p className="mt-1 text-xs text-silver-dark">
            The team cards on /about. Upload a photo per member or leave it
            blank to fall back to initials. Reorder with the arrows, hide one
            with the Active toggle.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={pending}
        >
          + Add Member
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {initialMembers.length === 0 ? (
        <p className="rounded-lg border border-silver bg-gray-50 p-8 text-center text-sm text-silver-dark">
          No team members yet. Click &ldquo;Add Member&rdquo; to create one.
        </p>
      ) : (
        <ul className="space-y-3">
          {initialMembers.map((member, idx) => (
            <MemberRow
              key={member.id}
              member={member}
              index={idx}
              total={initialMembers.length}
              busy={pending && busyId === member.id}
              onDelete={() => handleDelete(member)}
              onMoveUp={() => handleReorder(member, "up")}
              onMoveDown={() => handleReorder(member, "down")}
              onSaved={refresh}
              onError={setError}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface MemberRowProps {
  member: AboutTeamMemberRow;
  index: number;
  total: number;
  busy: boolean;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSaved: () => void;
  onError: (msg: string | null) => void;
}

function MemberRow({
  member,
  index,
  total,
  busy,
  onDelete,
  onMoveUp,
  onMoveDown,
  onSaved,
  onError,
}: MemberRowProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(member.photo_url);
  const [name, setName] = useState(member.name);
  const [role, setRole] = useState(member.role);
  const [bio, setBio] = useState(member.bio ?? "");
  const [isActive, setIsActive] = useState(member.is_active);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `about-team/${member.id}-${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

      setPhotoUrl(urlData.publicUrl);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleRemoveImage() {
    if (!photoUrl) return;
    if (!confirm("Remove the photo from this team member?")) return;
    onError(null);
    try {
      const supabase = createClient();
      const path = extractPath(photoUrl);
      if (path) {
        await supabase.storage.from(BUCKET).remove([path]);
      }
      setPhotoUrl(null);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to remove image");
    }
  }

  async function handleSave() {
    onError(null);
    setSaving(true);
    const res = await updateAboutTeamMember(member.id, {
      name,
      role,
      bio,
      photo_url: photoUrl,
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
        {/* Photo preview + upload */}
        <div className="md:w-40 md:shrink-0">
          <div className="relative aspect-square overflow-hidden rounded-full border border-silver bg-white">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt=""
                fill
                className="object-cover"
                sizes="160px"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-200 text-3xl font-bold text-silver-dark">
                {initials || "—"}
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <label className="flex-1 cursor-pointer rounded-md border border-silver bg-white px-3 py-1.5 text-center text-xs font-medium text-navy hover:border-accent hover:text-accent">
              {uploading ? "Uploading..." : photoUrl ? "Replace" : "Upload"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
            {photoUrl && (
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
              Member {index + 1}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onMoveUp}
                disabled={busy || index === 0}
                className="rounded-md border border-silver bg-white px-2 py-1 text-xs text-navy hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                disabled={busy || index === total - 1}
                className="rounded-md border border-silver bg-white px-2 py-1 text-xs text-navy hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
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
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Sales Manager"
            />
          </div>

          <Textarea
            label="Introduction"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="min-h-[80px]"
            placeholder="A short note from this team member — what they do, how long they've been with us, anything they'd like customers to know."
          />

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
              {saving ? "Saving..." : "Save member"}
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
