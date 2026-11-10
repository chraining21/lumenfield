"use client";

import { useState } from "react";
import type { Image } from "@/types";
import ProductVisual from "./ProductVisual";

type Props = { images: Image[]; lightTypeId?: number; photoLabel: string };

// 主圖＋縮圖切換
export default function ProductGallery({ images, lightTypeId, photoLabel }: Props) {
  const [index, setIndex] = useState(0);
  const total = String(images.length).padStart(2, "0");
  const no = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <div>
      <ProductVisual
        src={images[index]?.url}
        lightTypeId={lightTypeId}
        caption={`${photoLabel} ${no(index)} / ${total}`}
        className="border border-ink"
      />
      {images.length > 1 && (
        <ul className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${photoLabel} ${no(i)}`}
                aria-pressed={i === index}
                className={`grid h-12 w-16 place-items-center border font-mono text-xs ${
                  i === index ? "border-ink bg-highlight" : "border-line hover:border-ink"
                }`}
              >
                {no(i)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
