"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Category, CategoryType, Image as AdminImage } from "@/types";

// 後台表單共用的欄位外框、照片上傳、底部按鈕

export const inputClass =
  "w-full border border-ink bg-bg px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/40 aria-invalid:border-red-600 dark:aria-invalid:border-red-400";

export const pickButton = "cursor-pointer border border-dashed border-ink px-4 py-2 text-sm hover:bg-highlight";

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// 新上傳的檔案先給負數暫時 id，正式 id 由後端產生
let tempId = 0;
export const nextTempId = () => --tempId;

// 上傳是非同步的：完成時要接在「最新」的清單後面，否則上傳期間的移除、排序會被蓋掉
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

export type Uploaded = { url: string; fileName: string; sizeBytes: number };

// demo 唯讀帳號（後端 VIEWER）存檔、上傳都會被擋（403）
export const READONLY_MESSAGE = "這是唯讀的 demo 帳號：可以瀏覽和試填，但不能存檔或上傳。";

const UPLOAD_ERRORS: Record<number, string> = {
  400: "檔案格式不支援",
  401: "登入已過期，請重新登入",
  403: READONLY_MESSAGE,
  413: "檔案太大（照片 10MB、檔案 50MB 以內）",
};

// 選檔後馬上傳到後端（經 /admin/upload 轉送）；類型與大小由後端把關
export async function uploadFile(file: File, type: "image" | "file"): Promise<Uploaded> {
  const body = new FormData();
  body.set("file", file);
  body.set("type", type);
  const res = await fetch("/admin/upload", { method: "POST", body });
  if (!res.ok) throw new Error(`${file.name}：${UPLOAD_ERRORS[res.status] ?? "上傳失敗"}`);
  return res.json();
}

// 送出失敗時，等錯誤標記畫上去後跳到第一個要修正的欄位
export function focusFirstError(form: HTMLFormElement) {
  requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
}

export function Section({ code, title, single, children }: { code: string; title: string; single?: boolean; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 flex items-baseline gap-3 border-b border-ink pb-2 font-bold">
        <span className="label-mono">{code}</span>
        {title}
      </h2>
      <div className={single ? "grid gap-5" : "grid gap-5 min-[640px]:grid-cols-2"}>{children}</div>
    </section>
  );
}

export function Field(props: { label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm">
        {props.label}
        {props.required && <span className="ml-1 text-red-600 dark:text-red-400">*</span>}
      </span>
      {props.children}
      {props.error ? (
        <span className="mt-1 block text-xs text-red-600 dark:text-red-400">{props.error}</span>
      ) : (
        props.hint && <span className="mt-1 block text-xs text-muted">{props.hint}</span>
      )}
    </label>
  );
}

export function CategoryToggles(props: {
  categories: Category[];
  type: CategoryType;
  legend: string;
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const toggle = (id: number) =>
    props.onChange(props.selected.includes(id) ? props.selected.filter((x) => x !== id) : [...props.selected, id]);
  return (
    <fieldset>
      <legend className="mb-2 text-sm">{props.legend}</legend>
      <div className="flex flex-wrap gap-2">
        {props.categories
          .filter((c) => c.type === props.type)
          .map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-2 border border-ink px-3 py-1.5 text-sm has-checked:bg-ink has-checked:text-bg has-focus-visible:ring-2 has-focus-visible:ring-brand/40"
            >
              <input type="checkbox" checked={props.selected.includes(c.id)} onChange={() => toggle(c.id)} className="sr-only" />
              {c.name.zh}
            </label>
          ))}
      </div>
    </fieldset>
  );
}

// cover：第一張當主圖（列表、卡片用的那張）
export function ImagesField(props: { images: AdminImage[]; onChange: (v: AdminImage[]) => void; cover?: boolean; error?: string }) {
  const { images, onChange, cover, error } = props;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const latest = useLatest(images);
  const renumber = (list: AdminImage[]) => list.map((x, i) => ({ ...x, sortOrder: i + 1 }));
  const add = async (list: FileList | null) => {
    if (!list?.length) return;
    setUploading(true);
    setUploadError(null);
    const added: AdminImage[] = [];
    // 一張一張傳，失敗的跳過並顯示原因，成功的照樣加入
    for (const f of Array.from(list)) {
      try {
        const { url } = await uploadFile(f, "image");
        added.push({ id: nextTempId(), url, sortOrder: 0 });
      } catch (e) {
        setUploadError((e as Error).message);
      }
    }
    onChange(renumber([...latest.current, ...added]));
    setUploading(false);
  };
  const remove = (id: number) => onChange(renumber(images.filter((x) => x.id !== id)));
  const move = (i: number, by: -1 | 1) => {
    const list = [...images];
    [list[i], list[i + by]] = [list[i + by], list[i]];
    onChange(renumber(list));
  };

  const tool = "flex-1 py-1 text-xs hover:bg-highlight disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div>
      {images.length > 0 && (
        <ol className="mb-3 grid grid-cols-2 gap-3 min-[640px]:grid-cols-4">
          {images.map((img, i) => (
            <li key={img.id} className="relative border border-ink">
              <div className="relative aspect-[4/3] bg-surface">
                {/^(\/files\/|https?:)/.test(img.url) ? (
                  <Image src={img.url} alt="" fill unoptimized sizes="200px" className="object-cover" />
                ) : (
                  // TODO: 假資料的圖片路徑沒有實際檔案，先顯示檔名
                  <span className="absolute inset-0 grid place-items-center p-2 text-center font-mono text-[11px] break-all text-muted">
                    {img.url.split("/").pop()}
                  </span>
                )}
              </div>
              <span className="label-mono absolute top-1 left-1 bg-bg px-1">{cover && i === 0 ? "主圖" : i + 1}</span>
              <div className="flex divide-x divide-ink border-t border-ink">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`第 ${i + 1} 張往前`} className={tool}>
                  ←
                </button>
                <button type="button" onClick={() => remove(img.id)} className={`${tool} flex-2`}>
                  移除
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label={`第 ${i + 1} 張往後`} className={tool}>
                  →
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      <label className={`inline-block ${pickButton} has-focus-visible:ring-2 has-focus-visible:ring-brand/40`}>
        {uploading ? "上傳中…" : "＋ 上傳照片"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={uploading}
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
          aria-invalid={!!error}
          className="sr-only"
        />
      </label>
      <span className="ml-3 text-xs text-muted">{cover ? "第一張為主圖，" : ""}用 ← → 調整順序</span>
      {(error || uploadError) && (
        <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
          {uploadError ?? error}
        </p>
      )}
    </div>
  );
}

export function FormActions(props: { errorCount: number; cancelHref: string; pending?: boolean; saveError?: string }) {
  const { errorCount, cancelHref, pending } = props;
  return (
    <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t-2 border-ink bg-bg py-4">
      {errorCount > 0 && <p className="text-sm text-red-600 dark:text-red-400">有 {errorCount} 個欄位要修正</p>}
      {props.saveError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {props.saveError}
        </p>
      )}
      <Link href={cancelHref} className="ml-auto border border-ink px-4 py-2 text-sm hover:bg-highlight">
        取消
      </Link>
      <button
        type="submit"
        disabled={pending}
        className="border-[1.5px] border-ink bg-ink px-5 py-2 text-sm font-medium text-bg enabled:hover:border-brand enabled:hover:bg-brand enabled:hover:text-[#1d1f22] disabled:opacity-60"
      >
        {pending ? "儲存中…" : "儲存"}
      </button>
    </div>
  );
}

export function NotFoundNote({ what, backHref }: { what: string; backHref: string }) {
  return (
    <div className="border border-dashed border-muted p-10 text-center">
      <p className="mb-4">
        找不到這個{what}，網址的編號可能有誤。
      </p>
      <Link href={backHref} className="font-mono text-sm hover:underline">
        ← 回{what}列表
      </Link>
    </div>
  );
}
