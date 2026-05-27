export function displayInitials(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  const a = parts[0]?.[0] ?? "?";
  const b = parts[1]?.[0];
  return (a + (b ?? "")).toUpperCase();
}
