"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GENDER_OPTIONS, ROOMMATE_LIFESTYLE_TAGS } from "@/lib/constants";
import type { RoommatePost } from "@/lib/types";

type Props = {
  mode: "create" | "edit";
  userId: string;
  initialPost?: RoommatePost;
};

export function RoommatePostForm({ mode, userId, initialPost }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<"find_room" | "find_person">(
    initialPost?.type ?? "find_room"
  );
  const [budget, setBudget] = useState(String(initialPost?.budget ?? ""));
  const [district, setDistrict] = useState(initialPost?.district ?? "");
  const [gender, setGender] = useState(initialPost?.gender ?? "");
  const [age, setAge] = useState(String(initialPost?.age ?? ""));
  const [occupation, setOccupation] = useState(initialPost?.occupation ?? "");
  const [description, setDescription] = useState(initialPost?.description ?? "");
  const [lifestyleTags, setLifestyleTags] = useState<string[]>(
    initialPost?.lifestyle_tags ?? []
  );
  const [hasPet, setHasPet] = useState(initialPost?.has_pet ?? false);
  const [smoking, setSmoking] = useState(initialPost?.smoking ?? false);

  function toggleTag(value: string) {
    setLifestyleTags((tags) =>
      tags.includes(value) ? tags.filter((v) => v !== value) : [...tags, value]
    );
  }

  async function handleSubmit() {
    if (!description.trim()) {
      setError(t("roommate.formErrorDescription"));
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();

    const payload = {
      type,
      budget: budget ? Number(budget) : null,
      district: district.trim() || null,
      gender: gender || null,
      age: age ? Number(age) : null,
      occupation: occupation.trim() || null,
      description: description.trim(),
      lifestyle_tags: lifestyleTags,
      has_pet: hasPet,
      smoking,
    };

    try {
      if (mode === "create") {
        const { error: insertError } = await supabase
          .from("roommate_posts")
          .insert({ ...payload, user_id: userId, status: "active" });
        if (insertError) throw insertError;
      } else if (initialPost) {
        const { error: updateError } = await supabase
          .from("roommate_posts")
          .update(payload)
          .eq("id", initialPost.id);
        if (updateError) throw updateError;
      }

      router.push("/roommate/manage");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm sm:p-8">
      <h1 className="mb-6 text-xl font-semibold text-ink">
        {t(mode === "create" ? "roommate.formTitleCreate" : "roommate.formTitleEdit")}
      </h1>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">
            {t("roommate.formType")}
          </span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "find_room" | "find_person")}
            className="input"
          >
            <option value="find_room">{t("roommate.tabFindRoom")}</option>
            <option value="find_person">{t("roommate.tabFindPerson")}</option>
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              {t("roommate.formBudget")}
            </span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              {t("roommate.formDistrict")}
            </span>
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="input"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              {t("roommate.formGender")}
            </span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="input"
            >
              <option value="">—</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {t(`gender.${g.value}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">
              {t("roommate.formAge")}
            </span>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="input"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">
            {t("roommate.formOccupation")}
          </span>
          <input
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            className="input"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">
            {t("roommate.formDescription")}
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="input"
          />
        </label>

        <fieldset>
          <legend className="mb-1 text-sm font-medium text-neutral-700">
            {t("roommate.formLifestyle")}
          </legend>
          <div className="grid grid-cols-2 gap-1">
            {ROOMMATE_LIFESTYLE_TAGS.map((tag) => (
              <label
                key={tag.value}
                className="flex items-center gap-2 text-sm text-neutral-600"
              >
                <input
                  type="checkbox"
                  checked={lifestyleTags.includes(tag.value)}
                  onChange={() => toggleTag(tag.value)}
                />
                {tag.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={hasPet}
              onChange={(e) => setHasPet(e.target.checked)}
            />
            {t("roommate.formHasPet")}
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={smoking}
              onChange={(e) => setSmoking(e.target.checked)}
            />
            {t("roommate.formSmoking")}
          </label>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading
            ? t("roommate.formSaving")
            : t(mode === "create" ? "roommate.formSubmitCreate" : "roommate.formSubmitEdit")}
        </button>
      </div>
    </div>
  );
}
