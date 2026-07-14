"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  AMENITIES,
  CITIES,
  LIFESTYLE_CONDITIONS,
  LISTING_TYPES,
} from "@/lib/constants";
import type { Listing } from "@/lib/types";

type Props = {
  mode: "create" | "edit";
  userId: string;
  initialListing?: Listing;
};

const STEP_TITLES = ["Thông tin cơ bản", "Vị trí & tiện ích", "Hình ảnh"];

function sanitizeFileName(name: string) {
  const withoutDiacritics = Array.from(name.normalize("NFD"))
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code < 0x0300 || code > 0x036f;
    })
    .join("");

  return withoutDiacritics
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");
}

export function ListingForm({ mode, userId, initialListing }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialListing?.title ?? "");
  const [description, setDescription] = useState(
    initialListing?.description ?? ""
  );
  const [type, setType] = useState(initialListing?.type ?? "room");
  const [price, setPrice] = useState(String(initialListing?.price ?? ""));
  const [area, setArea] = useState(String(initialListing?.area ?? ""));

  const [city, setCity] = useState(initialListing?.city ?? CITIES[0]);
  const [district, setDistrict] = useState(initialListing?.district ?? "");
  const [address, setAddress] = useState(initialListing?.address ?? "");
  const [amenities, setAmenities] = useState<string[]>(
    initialListing?.amenities ?? []
  );
  const [lifestyle, setLifestyle] = useState<string[]>(
    initialListing?.lifestyle_conditions ?? []
  );

  const [existingImages, setExistingImages] = useState<string[]>(
    initialListing?.images ?? []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);

  function toggle(arr: string[], setArr: (v: string[]) => void, value: string) {
    setArr(
      arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
    );
  }

  function goNext() {
    setError(null);
    if (step === 1 && !title.trim()) {
      setError("Vui lòng nhập tiêu đề tin đăng.");
      return;
    }
    if (step === 2 && !city) {
      setError("Vui lòng chọn thành phố.");
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit() {
    if (existingImages.length + newFiles.length === 0) {
      setError("Vui lòng tải lên ít nhất 1 ảnh.");
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      const uploadedUrls: string[] = [];
      for (const file of newFiles) {
        const path = `${userId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(path, file);
        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from("listing-images")
          .getPublicUrl(path);
        uploadedUrls.push(publicUrl.publicUrl);
      }

      const images = [...existingImages, ...uploadedUrls];
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        type,
        price: price ? Number(price) : null,
        area: area ? Number(area) : null,
        city,
        district: district.trim() || null,
        address: address.trim() || null,
        amenities,
        lifestyle_conditions: lifestyle,
        images,
      };

      if (mode === "create") {
        const { error: insertError } = await supabase.from("listings").insert({
          ...payload,
          user_id: userId,
          status: "pending",
          tier: "normal",
        });
        if (insertError) throw insertError;
      } else if (initialListing) {
        const { error: updateError } = await supabase
          .from("listings")
          .update(payload)
          .eq("id", initialListing.id);
        if (updateError) throw updateError;
      }

      router.push("/dashboard/landlord/listings");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center gap-2">
        {STEP_TITLES.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                step === i + 1
                  ? "bg-primary text-white"
                  : step > i + 1
                  ? "bg-primary/20 text-primary"
                  : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {i + 1}
            </div>
            <span className="hidden text-xs text-neutral-500 sm:inline">
              {label}
            </span>
            {i < STEP_TITLES.length - 1 && (
              <div className="h-px flex-1 bg-neutral-200" />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Tiêu đề tin đăng
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Mô tả
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Loại hình
            </span>
            <select
              value={type}
              onChange={(e) =>
                setType(
                  e.target.value as NonNullable<Listing["type"]>
                )
              }
              className="input"
            >
              {LISTING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-neutral-700">
                Giá thuê (đ/tháng)
              </span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-neutral-700">
                Diện tích (m²)
              </span>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="input"
              />
            </label>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Thành phố
            </span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="input"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Quận/Huyện
            </span>
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Địa chỉ cụ thể
            </span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input"
            />
          </label>

          <fieldset>
            <legend className="mb-1 text-sm font-medium text-neutral-700">
              Tiện ích
            </legend>
            <div className="grid grid-cols-2 gap-1">
              {AMENITIES.map((a) => (
                <label
                  key={a.value}
                  className="flex items-center gap-2 text-sm text-neutral-600"
                >
                  <input
                    type="checkbox"
                    checked={amenities.includes(a.value)}
                    onChange={() =>
                      toggle(amenities, setAmenities, a.value)
                    }
                  />
                  {a.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1 text-sm font-medium text-neutral-700">
              Điều kiện sống
            </legend>
            <div className="grid grid-cols-2 gap-1">
              {LIFESTYLE_CONDITIONS.map((l) => (
                <label
                  key={l.value}
                  className="flex items-center gap-2 text-sm text-neutral-600"
                >
                  <input
                    type="checkbox"
                    checked={lifestyle.includes(l.value)}
                    onChange={() => toggle(lifestyle, setLifestyle, l.value)}
                  />
                  {l.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          {existingImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {existingImages.map((src) => (
                <div key={src} className="group relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setExistingImages((imgs) =>
                        imgs.filter((i) => i !== src)
                      )
                    }
                    className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              Thêm ảnh phòng
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setNewFiles(Array.from(e.target.files ?? []))
              }
              className="input"
            />
          </label>

          {newFiles.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {newFiles.map((file, i) => (
                <div key={i} className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="h-full w-full rounded-lg object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1 || loading}
          className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 disabled:opacity-40"
        >
          Quay lại
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Tiếp tục
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading
              ? "Đang lưu..."
              : mode === "create"
              ? "Đăng tin"
              : "Lưu thay đổi"}
          </button>
        )}
      </div>
    </div>
  );
}
