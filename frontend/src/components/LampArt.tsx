// 產品示意圖（產品照片未到前的替代圖），依燈型分類畫
const SHAPES: Record<number, React.ReactNode> = {
  1: (
    <>
      <rect x="35" y="30" width="50" height="14" rx="2" />
      <path d="M42 44 L38 70 H82 L78 44" />
      <ellipse cx="60" cy="70" rx="22" ry="4" />
    </>
  ),
  2: (
    <>
      <rect x="28" y="38" width="64" height="38" rx="4" />
      <path d="M60 76 V92 M44 92 H76" />
      <path d="M34 46 H86 M34 54 H86 M34 62 H86" opacity=".5" />
    </>
  ),
  3: (
    <>
      <rect x="14" y="52" width="92" height="12" rx="2" />
      <path d="M18 58 H102" strokeDasharray="3 3" />
    </>
  ),
  4: (
    <>
      <path d="M60 10 V38" />
      <ellipse cx="60" cy="58" rx="40" ry="16" />
      <ellipse cx="60" cy="58" rx="32" ry="11" />
    </>
  ),
};

export default function LampArt({ lightTypeId }: { lightTypeId?: number }) {
  return (
    <svg viewBox="0 0 120 100" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      {lightTypeId ? SHAPES[lightTypeId] : null}
    </svg>
  );
}
