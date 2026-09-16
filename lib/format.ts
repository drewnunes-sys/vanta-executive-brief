export function formatDelta(
  current: number,
  previous: number | undefined,
  fractionDigits = 0,
  suffix = "",
) {
  if (previous === undefined) return "n/a";
  const delta = current - previous;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(fractionDigits)}${suffix}`;
}

export function formatAge(date: Date | null) {
  if (!date) return "Unknown";
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
  return `${days} day${days === 1 ? "" : "s"}`;
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
