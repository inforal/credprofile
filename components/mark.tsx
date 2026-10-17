export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#1636b8" />
      <rect x="7" y="8" width="13" height="16" rx="3" fill="#ffffff" opacity="0.95" />
      <rect x="13" y="12" width="12" height="12" rx="3" fill="#d7e3ff" />
      <circle cx="22.5" cy="10" r="2.2" fill="#ff8a6a" />
    </svg>
  );
}
