export function VantaMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M6 5h7.2L16 22.2 18.8 5H26L16 27 6 5Z"
        fill="#260048"
      />
    </svg>
  );
}
