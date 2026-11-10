import Image from "next/image";
import LampArt from "@/components/LampArt";

type Props = {
  src?: string;
  alt?: string;
  lightTypeId?: number;
  caption?: string;
  className?: string;
};

// 後台上傳的照片（/files/...）才顯示；沒有照片或假資料的路徑（/mock/... 沒有檔案）用燈型示意圖代替
export function isUploadedPhoto(url?: string): url is string {
  return !!url && url.startsWith("/files/");
}

export default function ProductVisual({ src, alt = "", lightTypeId, caption, className = "" }: Props) {
  return (
    <div className={`relative aspect-[4/3] overflow-hidden bg-surface text-ink ${className}`}>
      {isUploadedPhoto(src) ? (
        <Image src={src} alt={alt} fill sizes="(min-width: 900px) 50vw, 100vw" className="object-cover" />
      ) : (
        <div className="absolute inset-0 p-[18%]">
          <LampArt lightTypeId={lightTypeId} />
        </div>
      )}
      {caption && (
        <span className="label-mono absolute top-2 left-2.5 bg-surface/80 px-1 text-[11px]">{caption}</span>
      )}
    </div>
  );
}
