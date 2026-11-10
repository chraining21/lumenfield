"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { saveProduct } from "@/app/admin/(panel)/products/actions";
import { fileSize } from "@/lib/product";
import type { Category, Product, ProductFile, ProductFileKind } from "@/types";
import {
  CategoryToggles,
  Field,
  FormActions,
  focusFirstError,
  ImagesField,
  inputClass as input,
  nextTempId,
  pickButton,
  READONLY_MESSAGE,
  Section,
  SLUG_PATTERN,
  uploadFile,
  useLatest,
} from "./AdminForm";

const EMPTY: Product = {
  id: 0,
  slug: "",
  modelNo: "",
  name: { zh: "", en: "" },
  priceVisible: false,
  categoryIds: [],
  images: [],
  applicationImages: [],
  files: [],
};

const FILE_KINDS: Record<ProductFileKind, string> = { CATALOG_PDF: "型錄", IES: "IES 配光檔", CAD: "CAD 圖檔" };

type Props = { product: Product | null; others: Product[]; categories: Category[] };

// product 為 null 代表新增；others 用來先在畫面上檢查網址代稱重複（後端也會再擋）
export default function ProductForm({ product, others, categories }: Props) {
  // Next 會保留離開的頁面狀態；點連結進來時換新 key 讓表單重來，按上一頁才保留未存的內容
  const { bfcacheId } = useRouter();
  const initial = product ?? EMPTY;
  return <Editor key={`${initial.id}-${bfcacheId}`} initial={initial} others={others} categories={categories} />;
}

const SAVE_ERRORS = {
  invalid: "資料格式不正確，請檢查後再存。",
  readonly: READONLY_MESSAGE,
  failed: "儲存失敗，請稍後再試。",
};

function Editor({ initial, others, categories }: { initial: Product; others: Product[]; categories: Category[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [p, setP] = useState(initial);
  const [price, setPrice] = useState(initial.price?.toString() ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof Product>(key: K, value: Product[K]) => setP((d) => ({ ...d, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!p.modelNo.trim()) e.modelNo = "必填";
    if (!SLUG_PATTERN.test(p.slug)) e.slug = "只能用小寫英文、數字和 -";
    else if (others.some((o) => o.slug === p.slug)) e.slug = "已有產品使用這個網址";
    if (!p.name.zh.trim()) e.nameZh = "必填";
    if (!p.name.en.trim()) e.nameEn = "必填";
    if (price && !/^\d+$/.test(price)) e.price = "請填整數";
    else if (p.priceVisible && !price) e.price = "要公開價格就必須填價格";
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
        const result = await saveProduct(initial.id || null, {
          slug: p.slug,
          modelNo: p.modelNo.trim(),
          name: { zh: p.name.zh.trim(), en: p.name.en.trim() },
          wattage: p.wattage ?? "",
          colorTemperature: p.colorTemperature ?? "",
          dimensions: p.dimensions ?? "",
          ipRating: p.ipRating ?? "",
          price: price ? Number(price) : null,
          priceVisible: p.priceVisible,
          categoryIds: p.categoryIds,
          images: p.images.map(({ url }) => ({ url })),
          applicationImages: p.applicationImages.map(({ url }) => ({ url })),
          files: p.files.map(({ kind, url, fileName, sizeBytes }) => ({ kind, url, fileName, sizeBytes })),
        });
        if (!result) return;
        const { error } = result;
        if (error === "slug" || error === "modelNo") {
          setErrors({ [error]: error === "slug" ? "已有產品使用這個網址" : "已有產品使用這個型號" });
          if (formRef.current) focusFirstError(formRef.current);
        } else {
          setSaveError(SAVE_ERRORS[error]);
        }
      } catch {
        setSaveError(SAVE_ERRORS.failed);
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="grid max-w-3xl gap-10">
      <Section code="A" title="基本資料">
        <Field label="型號" required error={errors.modelNo}>
          <input value={p.modelNo} onChange={(e) => set("modelNo", e.target.value)} aria-invalid={!!errors.modelNo} className={`${input} font-mono`} />
        </Field>
        <Field label="網址代稱" required error={errors.slug} hint={`前台網址：/products/${p.slug || "…"}`}>
          <input value={p.slug} onChange={(e) => set("slug", e.target.value)} aria-invalid={!!errors.slug} className={`${input} font-mono`} />
        </Field>
        <Field label="中文名稱" required error={errors.nameZh}>
          <input value={p.name.zh} onChange={(e) => set("name", { ...p.name, zh: e.target.value })} aria-invalid={!!errors.nameZh} className={input} />
        </Field>
        <Field label="英文名稱" required error={errors.nameEn}>
          <input value={p.name.en} onChange={(e) => set("name", { ...p.name, en: e.target.value })} aria-invalid={!!errors.nameEn} className={input} />
        </Field>
      </Section>

      <Section code="B" title="規格">
        <Field label="瓦數" hint="例：9W / 12W">
          <input value={p.wattage ?? ""} onChange={(e) => set("wattage", e.target.value)} className={input} />
        </Field>
        <Field label="色溫" hint="例：3000K / 4000K">
          <input value={p.colorTemperature ?? ""} onChange={(e) => set("colorTemperature", e.target.value)} className={input} />
        </Field>
        <Field label="尺寸" hint="例：Ø90 × H110 mm">
          <input value={p.dimensions ?? ""} onChange={(e) => set("dimensions", e.target.value)} className={input} />
        </Field>
        <Field label="防護等級" hint="例：IP65">
          <input value={p.ipRating ?? ""} onChange={(e) => set("ipRating", e.target.value)} className={input} />
        </Field>
      </Section>

      <Section code="C" title="價格">
        <Field label="價格（NT$）" error={errors.price}>
          <input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.trim())} aria-invalid={!!errors.price} className={`${input} font-mono`} />
        </Field>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input type="checkbox" checked={p.priceVisible} onChange={(e) => set("priceVisible", e.target.checked)} className="size-4 accent-ink" />
          在前台公開價格
          <span className="text-xs text-muted">（不公開時顯示「詢價」）</span>
        </label>
      </Section>

      <Section code="D" title="分類" single>
        <CategoryToggles categories={categories} type="LIGHT_TYPE" legend="燈型" selected={p.categoryIds} onChange={(v) => set("categoryIds", v)} />
        <CategoryToggles categories={categories} type="SPACE" legend="空間" selected={p.categoryIds} onChange={(v) => set("categoryIds", v)} />
      </Section>

      <Section code="E" title="產品照片" single>
        <ImagesField images={p.images} onChange={(v) => set("images", v)} cover />
      </Section>

      <Section code="F" title="應用照片" single>
        <ImagesField images={p.applicationImages} onChange={(v) => set("applicationImages", v)} />
      </Section>

      <Section code="G" title="下載檔案" single>
        <FilesField files={p.files} onChange={(v) => set("files", v)} />
      </Section>

      <FormActions errorCount={Object.keys(errors).length} cancelHref="/admin/products" pending={pending} saveError={saveError} />
    </form>
  );
}

function FilesField({ files, onChange }: { files: ProductFile[]; onChange: (v: ProductFile[]) => void }) {
  const [kind, setKind] = useState<ProductFileKind>("CATALOG_PDF");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const latest = useLatest(files);
  const add = async (f: File | undefined) => {
    if (!f) return;
    setUploading(true);
    setUploadError(null);
    try {
      const { url, fileName, sizeBytes } = await uploadFile(f, "file");
      onChange([...latest.current, { id: nextTempId(), kind, url, fileName, sizeBytes }]);
    } catch (e) {
      setUploadError((e as Error).message);
    }
    setUploading(false);
  };

  return (
    <div>
      {files.length > 0 && (
        <ul className="mb-3 divide-y divide-line border border-ink">
          {files.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 text-sm">
              <span className="label-mono w-20">{FILE_KINDS[f.kind]}</span>
              <span className="min-w-0 flex-1 font-mono break-all">{f.fileName}</span>
              <span className="font-mono text-xs text-muted">{fileSize(f.sizeBytes)}</span>
              <button type="button" onClick={() => onChange(files.filter((x) => x.id !== f.id))} className="text-xs hover:underline">
                移除
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <select value={kind} onChange={(e) => setKind(e.target.value as ProductFileKind)} aria-label="檔案類型" className={`${input} w-auto`}>
          {Object.entries(FILE_KINDS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
        <label className={pickButton}>
          {uploading ? "上傳中…" : "＋ 上傳檔案"}
          <input
            type="file"
            accept=".pdf,.ies,.ldt,.dwg,.dxf,.zip"
            disabled={uploading}
            onChange={(e) => {
              add(e.target.files?.[0]);
              e.target.value = "";
            }}
            className="sr-only"
          />
        </label>
        <span className="text-xs text-muted">PDF、IES、LDT、DWG、DXF、ZIP，50MB 以內</span>
      </div>
      {uploadError && (
        <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
          {uploadError}
        </p>
      )}
    </div>
  );
}
