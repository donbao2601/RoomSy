"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { CITIES } from "@/lib/constants";
import { DISTRICTS_BY_CITY } from "@/lib/districts";

const CITY_ALIASES: Record<(typeof CITIES)[number], string[]> = {
  "TP.HCM": ["hcm", "tphcm", "ho chi minh", "sai gon", "sg"],
  "Hà Nội": ["hn", "ha noi"],
  "Đà Nẵng": ["dn", "da nang"],
};

function normalizeCityInput(value: string) {
  return Array.from(value.normalize("NFD"))
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code < 0x0300 || code > 0x036f;
    })
    .join("")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/** Alias khớp đầy đủ (vd gõ xong "hcm"/"sg") — dùng để auto-chọn thành phố, giữ nguyên logic cũ. */
function matchCityByAlias(raw: string) {
  const normalized = normalizeCityInput(raw);
  return CITIES.find((c) =>
    CITY_ALIASES[c].some((alias) => normalized.includes(alias))
  );
}

/** Khớp một phần (đang gõ dở) — dùng để lọc danh sách hiển thị trong combobox. */
function cityMatchesQuery(city: (typeof CITIES)[number], query: string) {
  const nq = normalizeCityInput(query);
  if (!nq) return true;
  if (normalizeCityInput(city).includes(nq)) return true;
  return CITY_ALIASES[city].some((alias) => alias.includes(nq) || nq.includes(alias));
}

function formatThousands(digits: string) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

type ComboboxFieldProps = {
  query: string;
  selected: string;
  options: string[];
  onQueryChange: (raw: string) => void;
  onSelect: (option: string) => void;
  onBlurCommit: () => void;
  disabled?: boolean;
  disabledHint?: string;
  placeholder?: string;
  noMatchLabel: string;
};

function ComboboxField({
  query,
  selected,
  options,
  onQueryChange,
  onSelect,
  onBlurCommit,
  disabled,
  disabledHint,
  placeholder,
  noMatchLabel,
}: ComboboxFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => {
          onQueryChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => !disabled && setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => {
            setOpen(false);
            onBlurCommit();
          }, 120);
        }}
        disabled={disabled}
        placeholder={disabled ? disabledHint : placeholder}
        autoComplete="off"
        className="input disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-muted"
      />
      {open && !disabled && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-md">
          {options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">{noMatchLabel}</li>
          ) : (
            options.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-primary/10 ${
                    option === selected ? "bg-primary/10 font-medium text-primary" : "text-ink"
                  }`}
                >
                  {option}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export function SearchBar() {
  const router = useRouter();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const [city, setCity] = useState("");
  const [cityQuery, setCityQuery] = useState("");

  const [district, setDistrict] = useState("");
  const [districtQuery, setDistrictQuery] = useState("");

  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  function resetDistrict() {
    setDistrict("");
    setDistrictQuery("");
  }

  function handleCityQueryChange(raw: string) {
    setCityQuery(raw);
    if (raw.trim() === "") {
      setCity("");
      resetDistrict();
      return;
    }
    const matched = matchCityByAlias(raw);
    if (matched && matched !== city) {
      setCity(matched);
      resetDistrict();
    }
  }

  function handleCitySelect(option: string) {
    setCity(option);
    setCityQuery(option);
    resetDistrict();
  }

  function handleCityBlurCommit() {
    setCityQuery(city);
  }

  function handleDistrictQueryChange(raw: string) {
    setDistrictQuery(raw);
  }

  function handleDistrictSelect(option: string) {
    setDistrict(option);
    setDistrictQuery(option);
  }

  function handleDistrictBlurCommit() {
    setDistrictQuery(district);
  }

  const filteredCities = CITIES.filter((c) => cityMatchesQuery(c, cityQuery));

  const districtOptions = city ? DISTRICTS_BY_CITY[city as (typeof CITIES)[number]] ?? [] : [];
  const filteredDistricts = districtOptions.filter((d) =>
    normalizeCityInput(d).includes(normalizeCityInput(districtQuery))
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (city.trim()) params.set("city", city.trim());
    if (district.trim()) params.set("district", district.trim());
    if (priceMin) params.set("price_min", priceMin);
    if (priceMax) params.set("price_max", priceMax);
    setOpen(false);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="input mx-auto block w-full max-w-xl truncate text-left text-neutral-400"
      >
        {q || t("home.searchPlaceholder")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-10 sm:items-center">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-lg sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">
                {t("home.searchButton")}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted hover:text-ink"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-left text-sm font-medium text-body">
                  {t("search.keyword")}
                </label>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("home.searchPlaceholder")}
                  className="input"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-1 block text-left text-sm font-medium text-body">
                  {t("search.city")}
                </label>
                <ComboboxField
                  query={cityQuery}
                  selected={city}
                  options={filteredCities}
                  onQueryChange={handleCityQueryChange}
                  onSelect={handleCitySelect}
                  onBlurCommit={handleCityBlurCommit}
                  noMatchLabel={t("search.noMatch")}
                />
              </div>

              <div>
                <label className="mb-1 block text-left text-sm font-medium text-body">
                  {t("search.district")}
                </label>
                <ComboboxField
                  query={districtQuery}
                  selected={district}
                  options={filteredDistricts}
                  onQueryChange={handleDistrictQueryChange}
                  onSelect={handleDistrictSelect}
                  onBlurCommit={handleDistrictBlurCommit}
                  disabled={!city}
                  disabledHint={t("search.selectCityFirst")}
                  noMatchLabel={t("search.noMatch")}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-left text-sm font-medium text-body">
                    {t("search.priceFrom")}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatThousands(priceMin)}
                    onChange={(e) => setPriceMin(digitsOnly(e.target.value))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-left text-sm font-medium text-body">
                    {t("search.priceTo")}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatThousands(priceMax)}
                    onChange={(e) => setPriceMax(digitsOnly(e.target.value))}
                    className="input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                {t("home.searchButton")}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
