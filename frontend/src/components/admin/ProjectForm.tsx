"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { saveProject } from "@/app/admin/(panel)/projects/actions";
import { COUNTIES } from "@/data/taiwan-map";
import type { Category, CountyCode, Project } from "@/types";
import {
  CategoryToggles,
  Field,
  FormActions,
  focusFirstError,
  ImagesField,
  inputClass as input,
  Section,
  SLUG_PATTERN,
} from "./AdminForm";

// 北到南、再東部、離島
const COUNTY_ORDER: CountyCode[] = [
  "TW-KEE", "TW-TPE", "TW-NWT", "TW-TAO", "TW-HSZ", "TW-HSQ", "TW-MIA", "TW-TXG", "TW-CHA", "TW-NAN", "TW-YUN",
  "TW-CYI", "TW-CYQ", "TW-TNN", "TW-KHH", "TW-PIF", "TW-ILA", "TW-HUA", "TW-TTT", "TW-PEN", "TW-KIN", "TW-LIE",
];
const countyName = (code: CountyCode) => COUNTIES.find((c) => c.code === code)?.name.zh ?? code;

const FIRST_YEAR = 1993; // 公司成立

const EMPTY: Project = {
  id: 0,
  slug: "",
  title: { zh: "", en: "" },
  year: 0,
  categoryIds: [],
  location: { zh: "", en: "" },
  countyCode: "" as CountyCode, // 新增時強制選擇
  images: [],
};

type Props = { project: Project | null; others: Project[]; categories: Category[] };

// project 為 null 代表新增；others 用來先在畫面上檢查網址代稱重複（後端也會再擋）
export default function ProjectForm({ project, others, categories }: Props) {
  // Next 會保留離開的頁面狀態；點連結進來時換新 key 讓表單重來，按上一頁才保留未存的內容
  const { bfcacheId } = useRouter();
  const initial = project ?? EMPTY;
  return <Editor key={`${initial.id}-${bfcacheId}`} initial={initial} others={others} categories={categories} />;
}

const SAVE_ERRORS = { invalid: "資料格式不正確，請檢查後再存。", failed: "儲存失敗，請稍後再試。" };

function Editor({ initial, others, categories }: { initial: Project; others: Project[]; categories: Category[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [saveError, setSaveError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [p, setP] = useState(initial);
  const [desc, setDesc] = useState(initial.description ?? { zh: "", en: "" });
  const [year, setYear] = useState(initial.year ? String(initial.year) : "");
  const [lat, setLat] = useState(initial.latitude?.toString() ?? "");
  const [lng, setLng] = useState(initial.longitude?.toString() ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof Project>(key: K, value: Project[K]) => setP((d) => ({ ...d, [key]: value }));
  const validate = () => {
    const e: Record<string, string> = {};
    const lastYear = new Date().getFullYear() + 1;
    if (!p.title.zh.trim()) e.titleZh = "必填";
    if (!p.title.en.trim()) e.titleEn = "必填";
    if (!SLUG_PATTERN.test(p.slug)) e.slug = "只能用小寫英文、數字和 -";
    else if (others.some((o) => o.slug === p.slug)) e.slug = "已有案例使用這個網址";
    if (!/^\d{4}$/.test(year) || +year < FIRST_YEAR || +year > lastYear) e.year = `請填 ${FIRST_YEAR}–${lastYear} 的年份`;
    if (!p.location.zh.trim()) e.locationZh = "必填";
    if (!p.location.en.trim()) e.locationEn = "必填";
    if (!p.countyCode) e.county = "請選擇";
    if (!desc.zh.trim() !== !desc.en.trim()) e[desc.zh.trim() ? "descEn" : "descZh"] = "中英文說明要一起填";
    if (!lat !== !lng) e[lat ? "lng" : "lat"] = "經緯度要一起填";
    else if (lat && !(Number(lat) >= 21.5 && Number(lat) <= 26.5)) e.lat = "緯度應在 21.5–26.5 之間";
    else if (lng && !(Number(lng) >= 118 && Number(lng) <= 122.5)) e.lng = "經度應在 118–122.5 之間";
    if (p.images.length === 0) e.images = "至少要一張照片（前台列表用第一張當封面）";
    return e;
  };

  const submit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setSaveError(undefined);
    if (Object.keys(e).length) return focusFirstError(ev.currentTarget);
    startTransition(async () => {
      try {
        // 成功時 Server Action 直接轉回列表（不會有回傳值）；有回傳就是錯誤
        const result = await saveProject(initial.id || null, {
          slug: p.slug,
          title: { zh: p.title.zh.trim(), en: p.title.en.trim() },
          description: { zh: desc.zh.trim(), en: desc.en.trim() },
          year: Number(year),
          location: { zh: p.location.zh.trim(), en: p.location.en.trim() },
          countyCode: p.countyCode,
          latitude: lat ? Number(lat) : null,
          longitude: lng ? Number(lng) : null,
          categoryIds: p.categoryIds,
          images: p.images.map(({ url }) => ({ url })),
        });
        if (!result) return;
        if (result.error === "slug") {
          setErrors({ slug: "已有案例使用這個網址" });
          if (formRef.current) focusFirstError(formRef.current);
        } else {
          setSaveError(SAVE_ERRORS[result.error]);
        }
      } catch {
        setSaveError(SAVE_ERRORS.failed);
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="grid max-w-3xl gap-10">
      <Section code="A" title="基本資料">
        <Field label="中文標題" required error={errors.titleZh}>
          <input value={p.title.zh} onChange={(e) => set("title", { ...p.title, zh: e.target.value })} aria-invalid={!!errors.titleZh} className={input} />
        </Field>
        <Field label="英文標題" required error={errors.titleEn}>
          <input value={p.title.en} onChange={(e) => set("title", { ...p.title, en: e.target.value })} aria-invalid={!!errors.titleEn} className={input} />
        </Field>
        <Field label="網址代稱" required error={errors.slug} hint={`前台網址：/projects/${p.slug || "…"}`}>
          <input value={p.slug} onChange={(e) => set("slug", e.target.value)} aria-invalid={!!errors.slug} className={`${input} font-mono`} />
        </Field>
        <Field label="年份" required error={errors.year} hint="西元年，例：2026">
          <input inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value.trim())} aria-invalid={!!errors.year} className={`${input} font-mono`} />
        </Field>
      </Section>

      <Section code="B" title="說明">
        <Field label="中文說明" error={errors.descZh}>
          <textarea rows={6} value={desc.zh} onChange={(e) => setDesc({ ...desc, zh: e.target.value })} aria-invalid={!!errors.descZh} className={input} />
        </Field>
        <Field label="英文說明" error={errors.descEn}>
          <textarea rows={6} value={desc.en} onChange={(e) => setDesc({ ...desc, en: e.target.value })} aria-invalid={!!errors.descEn} className={input} />
        </Field>
      </Section>

      <Section code="C" title="分類" single>
        <CategoryToggles categories={categories} type="PROJECT" legend="案例分類" selected={p.categoryIds} onChange={(v) => set("categoryIds", v)} />
      </Section>

      <Section code="D" title="地點">
        <Field label="中文地點" required error={errors.locationZh} hint="例：嘉義縣新港鄉">
          <input value={p.location.zh} onChange={(e) => set("location", { ...p.location, zh: e.target.value })} aria-invalid={!!errors.locationZh} className={input} />
        </Field>
        <Field label="英文地點" required error={errors.locationEn} hint="例：Xingang, Chiayi County">
          <input value={p.location.en} onChange={(e) => set("location", { ...p.location, en: e.target.value })} aria-invalid={!!errors.locationEn} className={input} />
        </Field>
        <Field label="縣市" required error={errors.county} hint="前台地圖依縣市統計案例數">
          <select value={p.countyCode} onChange={(e) => set("countyCode", e.target.value as CountyCode)} aria-invalid={!!errors.county} className={input}>
            <option value="" disabled>
              請選擇
            </option>
            {COUNTY_ORDER.map((code) => (
              <option key={code} value={code}>
                {countyName(code)}
              </option>
            ))}
          </select>
        </Field>
        <div className="hidden min-[640px]:block" />
        <Field label="緯度" error={errors.lat} hint="選填，例：23.565">
          <input inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value.trim())} aria-invalid={!!errors.lat} className={`${input} font-mono`} />
        </Field>
        <Field label="經度" error={errors.lng} hint="選填，例：120.302">
          <input inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value.trim())} aria-invalid={!!errors.lng} className={`${input} font-mono`} />
        </Field>
        <p className="text-xs text-muted min-[640px]:col-span-2">
          經緯度兩個都填，前台地圖才會畫出位置點。可在 Google 地圖上對地點按右鍵，點第一行的數字複製。
        </p>
      </Section>

      <Section code="E" title="照片" single>
        <ImagesField images={p.images} onChange={(v) => set("images", v)} cover error={errors.images} />
      </Section>

      <FormActions errorCount={Object.keys(errors).length} cancelHref="/admin/projects" pending={pending} saveError={saveError} />
    </form>
  );
}
