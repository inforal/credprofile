export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M5 5h7M5 5v7M27 5h-7M27 5v7M5 27h7M5 27v-7M27 27h-7M27 27v-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect x="14" y="14" width="4" height="4" fill="#9d1c1c" />
    </svg>
  );
}
