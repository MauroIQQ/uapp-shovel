export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60) return "ahora";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHour < 6) return `${diffHour}h`;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  }
  if (msgDate.getTime() === yesterday.getTime()) return "Ayer";

  const dayDiff = Math.floor((today.getTime() - msgDate.getTime()) / 86400000);
  if (dayDiff < 7) {
    return date.toLocaleDateString("es-CL", { weekday: "short" });
  }

  return date.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" });
}

export function formatMessageTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
}

export function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) return "Hoy";
  if (msgDate.getTime() === yesterday.getTime()) return "Ayer";

  return date.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function shouldShowDateSeparator(
  current: string,
  previous: string | undefined,
): boolean {
  if (!previous) return true;
  const cur = new Date(current);
  const prev = new Date(previous);
  return (
    cur.getFullYear() !== prev.getFullYear() ||
    cur.getMonth() !== prev.getMonth() ||
    cur.getDate() !== prev.getDate()
  );
}
