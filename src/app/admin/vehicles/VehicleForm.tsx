"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import {
  carMakes,
  bodyTypes,
  fuelTypes,
  transmissionTypes,
} from "@/data/makes";
import type { VehicleRow } from "@/types/database";
import type {
  BasicConditionGuide,
  ConsumerInformationNotice,
} from "@/types/car";
import CinFields, { defaultCinFromVehicle } from "@/components/admin/CinFields";
import BcgFields, {
  defaultBcg,
  mergeBcgWithStandard,
} from "@/components/admin/BcgFields";
import { clearVehicleCin, updateVehicleCin } from "./[id]/cin/actions";
import { clearVehicleBcg, updateVehicleBcg } from "./[id]/bcg/actions";
import { createVehicle, updateVehicle } from "./actions";

const driveTypes = ["FWD", "RWD", "AWD", "4WD"] as const;
const statuses = ["available", "special", "sold"] as const;
const BUCKET = "vehicle-images";
const DRAFT_KEY = "ideal-cars-new-vehicle-draft";

function loadDraft(): Record<string, string> | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(DRAFT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export default function VehicleForm({
  initial,
}: {
  initial?: VehicleRow;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const isEdit = Boolean(initial);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft] = useState<Record<string, string> | null>(() =>
    isEdit ? null : loadDraft(),
  );
  const [draftToast, setDraftToast] = useState<string | null>(null);

  // CIN / BCG collapsible state — used in both new-vehicle and edit flows.
  const [cinOpen, setCinOpen] = useState(false);
  const [bcgOpen, setBcgOpen] = useState(false);
  const [cin, setCin] = useState<ConsumerInformationNotice | null>(
    initial?.cin ?? null,
  );
  const [bcg, setBcg] = useState<BasicConditionGuide | null>(
    initial?.bcg ? mergeBcgWithStandard(initial.bcg) : null,
  );
  const [cinDirty, setCinDirty] = useState(false);
  const [bcgDirty, setBcgDirty] = useState(false);

  function cinFromCurrentForm(
    base: ConsumerInformationNotice | null,
  ): ConsumerInformationNotice {
    const form = formRef.current
      ? new FormData(formRef.current)
      : new FormData();
    const seed = defaultCinFromVehicle({
      price: Number(form.get("price")) || 0,
      mileage: Number(form.get("mileage")) || 0,
      vin: String(form.get("vin") ?? ""),
      wof_expiry: String(form.get("wof_expiry") ?? ""),
      rego_expiry: String(form.get("rego_expiry") ?? ""),
      fuel_type: String(form.get("fuel_type") ?? "Petrol"),
    });
    if (!base) return seed;
    return {
      ...base,
      cashPrice: seed.cashPrice,
      odometer: seed.odometer,
      vin: seed.vin,
      wofOrCofExpiry: seed.wofOrCofExpiry,
      vehicleLicenceExpiry: seed.vehicleLicenceExpiry,
      operatingFuelType: seed.operatingFuelType,
      rucApplies: seed.rucApplies,
    };
  }

  function handleCinChange(next: ConsumerInformationNotice) {
    setCin(next);
    setCinDirty(true);
  }
  function handleBcgChange(next: BasicConditionGuide) {
    setBcg(next);
    setBcgDirty(true);
  }
  function pullCinFromVehicleDetails() {
    setCin(cinFromCurrentForm(cin));
    setCinDirty(true);
  }
  function openCin() {
    if (cin === null) {
      setCin(cinFromCurrentForm(null));
      if (isEdit) setCinDirty(true);
    }
    setCinOpen(true);
  }
  function openBcg() {
    if (bcg === null) {
      setBcg(defaultBcg());
      if (isEdit) setBcgDirty(true);
    }
    setBcgOpen(true);
  }
  function clearCinSection() {
    if (
      !window.confirm(
        isEdit
          ? "Clear the saved CIN for this vehicle? It will be removed on save."
          : "Clear the CIN section? It will not be saved with this vehicle.",
      )
    )
      return;
    setCin(null);
    setCinDirty(true);
    setCinOpen(false);
  }
  function clearBcgSection() {
    if (
      !window.confirm(
        isEdit
          ? "Clear the saved BCG for this vehicle? It will be removed on save."
          : "Clear the BCG section? It will not be saved with this vehicle.",
      )
    )
      return;
    setBcg(null);
    setBcgDirty(true);
    setBcgOpen(false);
  }

  useEffect(() => {
    const urls = pendingImages.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [pendingImages]);

  function handleSaveDraft() {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const obj: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (typeof value === "string" && value !== "") {
        obj[key] = value;
      }
    });
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(obj));
      setDraftToast("Draft saved.");
      setTimeout(() => setDraftToast(null), 2500);
    } catch {
      setError("Could not save draft (browser storage unavailable).");
    }
  }

  function handleDiscardDraft() {
    if (
      !window.confirm(
        "Discard the saved draft? This will clear the form.",
      )
    )
      return;
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {}
    window.location.reload();
  }

  function handleImagesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setPendingImages((prev) => [...prev, ...Array.from(files)]);
    e.target.value = "";
  }

  function removeImage(idx: number) {
    setPendingImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function uploadPendingImages(vehicleId: string) {
    const supabase = createClient();
    for (let idx = 0; idx < pendingImages.length; idx++) {
      const file = pendingImages[idx];
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${vehicleId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);
      const { error: insErr } = await supabase.from("vehicle_images").insert({
        vehicle_id: vehicleId,
        image_url: urlData.publicUrl,
        display_order: idx,
        is_primary: idx === 0,
      });
      if (insErr) throw insErr;
    }
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      if (isEdit) {
        const result = await updateVehicle(initial!.id, formData);
        if (result?.error) {
          setError(result.error);
          return;
        }
        if (cinDirty) {
          if (cin) {
            const res = await updateVehicleCin(initial!.id, cin);
            if ("error" in res && res.error) {
              setError(`Vehicle saved, but CIN failed: ${res.error}`);
              return;
            }
          } else {
            try {
              await clearVehicleCin(initial!.id);
            } catch (err) {
              setError(
                `Vehicle saved, but clearing CIN failed: ${
                  err instanceof Error ? err.message : "unknown error"
                }`,
              );
              return;
            }
          }
          setCinDirty(false);
        }
        if (bcgDirty) {
          if (bcg) {
            const res = await updateVehicleBcg(initial!.id, bcg);
            if ("error" in res && res.error) {
              setError(`Vehicle saved, but BCG failed: ${res.error}`);
              return;
            }
          } else {
            try {
              await clearVehicleBcg(initial!.id);
            } catch (err) {
              setError(
                `Vehicle saved, but clearing BCG failed: ${
                  err instanceof Error ? err.message : "unknown error"
                }`,
              );
              return;
            }
          }
          setBcgDirty(false);
        }
        router.refresh();
        return;
      }
      const result = await createVehicle(formData);
      const vehicleId = "vehicleId" in result ? result.vehicleId : undefined;
      if (!vehicleId) {
        setError(
          ("error" in result && result.error) || "Failed to create vehicle.",
        );
        return;
      }
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {}
      // Save CIN if the admin opened that section.
      if (cin) {
        const res = await updateVehicleCin(vehicleId, cin);
        if ("error" in res && res.error) {
          setError(
            `Vehicle saved, but CIN failed: ${res.error}. Edit the vehicle to retry.`,
          );
          router.push(`/admin/vehicles/${vehicleId}/edit`);
          router.refresh();
          return;
        }
      }
      // Save BCG if the admin opened that section.
      if (bcg) {
        const res = await updateVehicleBcg(vehicleId, bcg);
        if ("error" in res && res.error) {
          setError(
            `Vehicle saved, but BCG failed: ${res.error}. Edit the vehicle to retry.`,
          );
          router.push(`/admin/vehicles/${vehicleId}/edit`);
          router.refresh();
          return;
        }
      }
      if (pendingImages.length > 0) {
        try {
          await uploadPendingImages(vehicleId);
        } catch (err) {
          setError(
            `Vehicle saved, but image upload failed: ${
              err instanceof Error ? err.message : "unknown error"
            }. You can add images on the edit page.`,
          );
          router.push(`/admin/vehicles/${vehicleId}/edit`);
          router.refresh();
          return;
        }
      }
      router.push(`/admin/vehicles/${vehicleId}/edit`);
      router.refresh();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-8">
      {!isEdit && draft && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Restored a saved draft. Edit any field and save when ready, or
          <button
            type="button"
            onClick={handleDiscardDraft}
            className="ml-1 font-semibold text-amber-900 underline hover:no-underline"
          >
            discard the draft
          </button>
          .
        </div>
      )}
      {draftToast && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {draftToast}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <fieldset>
        <legend className="mb-4 text-lg font-bold text-navy">
          Identification
        </legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Stock Number *"
            name="stock_number"
            defaultValue={initial?.stock_number ?? draft?.stock_number ?? ""}
            required
          />
          <Input
            label="VIN"
            name="vin"
            defaultValue={initial?.vin ?? draft?.vin ?? ""}
            placeholder="17 characters"
            maxLength={17}
          />
          <Select
            label="Status *"
            name="status"
            defaultValue={initial?.status ?? draft?.status ?? "available"}
            required
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </Select>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-4 text-lg font-bold text-navy">Vehicle</legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label="Make *"
            name="make"
            defaultValue={initial?.make ?? draft?.make ?? ""}
            required
          >
            <option value="">Select make</option>
            {carMakes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <Input
            label="Model *"
            name="model"
            defaultValue={initial?.model ?? draft?.model ?? ""}
            required
          />
          <Input
            label="Year *"
            name="year"
            type="number"
            min={1990}
            max={new Date().getFullYear() + 1}
            defaultValue={initial?.year ?? draft?.year ?? ""}
            required
          />
          <Input
            label="Price (NZD) *"
            name="price"
            type="number"
            min={0}
            step="any"
            defaultValue={initial?.price ?? draft?.price ?? ""}
            required
          />
          <Input
            label="Mileage (km) *"
            name="mileage"
            type="number"
            min={0}
            defaultValue={initial?.mileage ?? draft?.mileage ?? ""}
            required
          />
          <Input
            label="Colour *"
            name="colour"
            defaultValue={initial?.colour ?? draft?.colour ?? ""}
            required
          />
          <Select
            label="Body Type *"
            name="body_type"
            defaultValue={initial?.body_type ?? draft?.body_type ?? ""}
            required
          >
            <option value="">Select</option>
            {bodyTypes.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
          <Select
            label="Fuel Type *"
            name="fuel_type"
            defaultValue={initial?.fuel_type ?? draft?.fuel_type ?? ""}
            required
          >
            <option value="">Select</option>
            {fuelTypes.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
          <Select
            label="Transmission *"
            name="transmission"
            defaultValue={initial?.transmission ?? draft?.transmission ?? ""}
            required
          >
            <option value="">Select</option>
            {transmissionTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Input
            label="Engine Size"
            name="engine_size"
            defaultValue={initial?.engine_size ?? draft?.engine_size ?? ""}
            placeholder="e.g. 2.0L"
          />
          <Select
            label="Drive Type"
            name="drive_type"
            defaultValue={initial?.drive_type ?? draft?.drive_type ?? ""}
          >
            <option value="">—</option>
            {driveTypes.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
          <Input
            label="Doors"
            name="doors"
            type="number"
            min={2}
            max={5}
            defaultValue={initial?.doors ?? draft?.doors ?? ""}
          />
          <Input
            label="Seats"
            name="seats"
            type="number"
            min={2}
            max={8}
            defaultValue={initial?.seats ?? draft?.seats ?? ""}
          />
          <Input
            label="WOF Expiry"
            name="wof_expiry"
            type="date"
            defaultValue={initial?.wof_expiry ?? draft?.wof_expiry ?? ""}
          />
          <Input
            label="Rego Expiry"
            name="rego_expiry"
            type="date"
            defaultValue={initial?.rego_expiry ?? draft?.rego_expiry ?? ""}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-4 text-lg font-bold text-navy">Details</legend>
        <div className="space-y-4">
          <Input
            label="Features (comma-separated)"
            name="features"
            defaultValue={
              initial?.features?.join(", ") ?? draft?.features ?? ""
            }
            placeholder="e.g. Bluetooth, Reversing Camera, Cruise Control"
          />
          <Textarea
            label="Description"
            name="description"
            rows={5}
            defaultValue={initial?.description ?? draft?.description ?? ""}
          />
        </div>
      </fieldset>

      {!isEdit && (
        <fieldset>
          <legend className="mb-4 text-lg font-bold text-navy">Photos</legend>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={pending}
                className="cursor-pointer rounded-lg border-2 border-dashed border-silver bg-gray-50 px-4 py-2 text-sm font-medium text-navy hover:border-accent hover:text-accent disabled:opacity-50"
              >
                + Add Photos
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImagesPicked}
              />
              <p className="text-xs text-silver-dark">
                The first photo becomes the primary image. JPG, PNG, or WebP.
              </p>
            </div>
            {pendingImages.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {pendingImages.map((file, idx) => (
                  <li
                    key={`${file.name}-${idx}`}
                    className="overflow-hidden rounded-lg border border-silver bg-white"
                  >
                    <div className="relative aspect-[4/3] bg-gray-100">
                      {previews[idx] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previews[idx]}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      )}
                      {idx === 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">
                          Primary
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      disabled={pending}
                      className="w-full p-2 text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </fieldset>
      )}

      <details
        className="overflow-hidden rounded-xl border border-silver bg-white"
        open={cinOpen}
        onToggle={(e) => {
          const open = (e.currentTarget as HTMLDetailsElement).open;
          if (open) openCin();
          else setCinOpen(false);
        }}
      >
        <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 bg-gray-50 px-5 py-3 text-base font-bold text-navy hover:bg-gray-100">
          <span className="flex flex-wrap items-center gap-2">
            <span>Consumer Information Notice</span>
            <span className="text-xs font-normal text-silver-dark">
              (NZ Fair Trading Act — required for sale)
            </span>
            {!cin && (
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-silver-dark">
                Not set
              </span>
            )}
            {cin && cinDirty && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                {initial?.cin ? "Unsaved changes" : "Will be saved"}
              </span>
            )}
            {cin && !cinDirty && (
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                {isEdit ? "Saved ✓" : "Will be saved"}
              </span>
            )}
          </span>
          <span className="flex items-center gap-3">
            {isEdit && initial?.cin && (
              <a
                href={`/api/vehicles/${initial.id}/cin.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-semibold text-accent underline hover:no-underline"
              >
                Preview PDF
              </a>
            )}
            <span className="text-silver-dark">▾</span>
          </span>
        </summary>
        <div className="border-t border-silver p-5">
          {cin && (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-silver bg-gray-50 p-3">
                <p className="text-xs text-silver-dark">
                  Vehicle-derived fields (price, mileage, VIN, WoF, rego, fuel)
                  can be auto-filled from the details you typed above.
                </p>
                <button
                  type="button"
                  onClick={pullCinFromVehicleDetails}
                  className="rounded-md border border-accent px-3 py-1 text-xs font-semibold text-accent hover:bg-accent hover:text-white"
                >
                  ↻ Pull from vehicle details
                </button>
              </div>
              <CinFields value={cin} onChange={handleCinChange} />
              <button
                type="button"
                onClick={clearCinSection}
                className="mt-4 text-sm font-medium text-silver-dark underline hover:text-red-600"
              >
                Clear CIN section
              </button>
            </>
          )}
        </div>
      </details>

      <details
        className="overflow-hidden rounded-xl border border-silver bg-white"
        open={bcgOpen}
        onToggle={(e) => {
          const open = (e.currentTarget as HTMLDetailsElement).open;
          if (open) openBcg();
          else setBcgOpen(false);
        }}
      >
        <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 bg-gray-50 px-5 py-3 text-base font-bold text-navy hover:bg-gray-100">
          <span className="flex flex-wrap items-center gap-2">
            <span>Basic Condition Guide</span>
            <span className="text-xs font-normal text-silver-dark">
              (inspection checklist)
            </span>
            {!bcg && (
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-silver-dark">
                Not set
              </span>
            )}
            {bcg && bcgDirty && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                {initial?.bcg ? "Unsaved changes" : "Will be saved"}
              </span>
            )}
            {bcg && !bcgDirty && (
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                {isEdit ? "Saved ✓" : "Will be saved"}
              </span>
            )}
          </span>
          <span className="flex items-center gap-3">
            {isEdit && initial?.bcg && (
              <a
                href={`/api/vehicles/${initial.id}/bcg.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-semibold text-accent underline hover:no-underline"
              >
                Preview PDF
              </a>
            )}
            <span className="text-silver-dark">▾</span>
          </span>
        </summary>
        <div className="border-t border-silver p-5">
          {bcg && (
            <>
              <BcgFields value={bcg} onChange={handleBcgChange} />
              <button
                type="button"
                onClick={clearBcgSection}
                className="mt-4 text-sm font-medium text-silver-dark underline hover:text-red-600"
              >
                Clear BCG section
              </button>
            </>
          )}
        </div>
      </details>

      {!isEdit && (
        <p className="text-sm text-silver-dark">
          New vehicles are created as <strong>drafts</strong> — they stay
          hidden from the public site until you press Publish in the Vehicles
          list.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending
            ? pendingImages.length > 0
              ? "Saving & uploading..."
              : "Saving..."
            : isEdit
              ? "Save Changes"
              : "Create Vehicle"}
        </Button>
        {!isEdit && (
          <>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={pending}
            >
              Save Draft
            </Button>
            {draft && (
              <button
                type="button"
                onClick={handleDiscardDraft}
                disabled={pending}
                className="text-sm font-medium text-silver-dark underline hover:text-red-600 disabled:opacity-50"
              >
                Discard draft
              </button>
            )}
          </>
        )}
      </div>
    </form>
  );
}
