// LUMENFIELD 標誌：地平線上的光。地平線跟著文字色，亮暗主題都看得到
export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden className="shrink-0">
      <circle cx="16" cy="15" r="9" fill="#F8B62B" />
      <rect x="3" y="21" width="26" height="2.5" fill="currentColor" />
    </svg>
  );
}
