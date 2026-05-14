/**
 * Classname merging utility — lightweight cn() without external deps.
 */
export function cn(...classes: unknown[]): string {
  return classes.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
}

/**
 * Deterministic avatar background color from name string.
 */
const avatarColors = [
  "bg-green-500",
  "bg-pink-500",
  "bg-yellow-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

/**
 * Extract initials from a name (max 2 characters).
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Human-readable relative time string.
 */
export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Group transaction-like items by date.
 */
export interface DateGroup<T> {
  label: string;
  items: T[];
}

export function groupByDate<T extends { created_at: string }>(items: T[]): DateGroup<T>[] {
  const groups: DateGroup<T>[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const grouped = new Map<string, T[]>();
  for (const item of items) {
    const dateStr = new Date(item.created_at).toDateString();
    if (!grouped.has(dateStr)) grouped.set(dateStr, []);
    grouped.get(dateStr)!.push(item);
  }

  for (const [dateStr, groupItems] of grouped) {
    const date = new Date(dateStr);
    let label: string;
    if (date.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        label = `${diffDays} days ago`;
      } else {
        label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    }
    groups.push({ label, items: groupItems });
  }
  return groups;
}

/**
 * Format a date for display.
 */
export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
