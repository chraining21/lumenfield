"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { Image as Photo } from "@/types";

// 照片在同一頁往下排；點了用 <dialog> 放大，可左右切換，Esc 關閉
export default function PhotoViewer({ photos, alt }: { photos: Photo[]; alt: string }) {
  const t = useTranslations("Projects");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const no = (i: number) => String(i + 1).padStart(2, "0");
  const total = String(photos.length).padStart(2, "0");
  const step = (d: number) => setIndex((i) => (i === null ? i : (i + d + photos.length) % photos.length));

  useEffect(() => {
    const dialog = dialogRef.current!;
    if (index !== null && !dialog.open) dialog.showModal();
  }, [index]);

  return (
    <>
      <ul className="grid gap-4 min-[640px]:grid-cols-2">
        {photos.map((p, i) => (
          <li key={p.id} className={i === 0 && photos.length % 2 ? "min-[640px]:col-span-2" : ""}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={t("viewPhoto", { n: i + 1 })}
              className="group relative block aspect-[3/2] w-full overflow-hidden border border-ink"
            >
              <Image
                src={p.url}
                alt={`${alt} ${no(i)}`}
                fill
                sizes="(min-width: 900px) 50vw, 100vw"
                className="object-cover transition-transform duration-600 group-hover:scale-105"
              />
              <span className="absolute bottom-2 left-2 bg-ink px-2 py-0.5 font-mono text-[11px] text-bg">
                {no(i)} / {total}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setIndex(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") step(-1);
          if (e.key === "ArrowRight") step(1);
        }}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}
        className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/85"
      >
        {index !== null && (
          <figure className="flex w-[min(1200px,94vw)] flex-col gap-3">
            <div className="relative h-[min(78vh,800px)]">
              <Image src={photos[index].url} alt={`${alt} ${no(index)}`} fill sizes="94vw" className="object-contain" />
            </div>
            <figcaption className="flex items-center justify-between font-mono text-xs text-[#e8e6df]">
              <button
                type="button"
                onClick={() => step(-1)}
                className="border border-current px-3 py-1.5 hover:bg-white/10"
              >
                ← {t("prevPhoto")}
              </button>
              <span>
                {no(index)} / {total}
              </span>
              <span className="flex gap-2">
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="border border-current px-3 py-1.5 hover:bg-white/10"
                >
                  {t("nextPhoto")} →
                </button>
                <button
                  type="button"
                  onClick={() => dialogRef.current?.close()}
                  className="border border-current px-3 py-1.5 hover:bg-white/10"
                  aria-label={t("close")}
                >
                  ×
                </button>
              </span>
            </figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}
