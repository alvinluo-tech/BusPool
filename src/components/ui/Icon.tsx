import { cn } from "@/lib/utils";

export type IconName =
  | "bus"
  | "home"
  | "share"
  | "tickets"
  | "wallet"
  | "profile"
  | "star"
  | "check"
  | "x"
  | "chevron-right"
  | "chevron-left"
  | "clock"
  | "camera"
  | "search"
  | "bell"
  | "shield"
  | "info"
  | "arrow-right"
  | "arrow-up-right"
  | "arrow-down-left"
  | "upload"
  | "users"
  | "grid"
  | "activity"
  | "alert"
  | "dollar"
  | "file-text"
  | "help"
  | "settings"
  | "mail";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  filled?: boolean;
}

const icons: Record<IconName, { viewBox: string; path: React.ReactNode }> = {
  bus: {
    viewBox: "0 0 24 24",
    path: (
      <path d="M8 6v6M15 6v6M2 12h19.6M18 18H5.4a2 2 0 01-2-1.8L2 5.6A2 2 0 014 4h14a2 2 0 012 2v12a4 4 0 01-4 4zM8 18a2 2 0 11-4 0M17 18a2 2 0 11-4 0" />
    ),
  },
  home: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </>
    ),
  },
  share: {
    viewBox: "0 0 24 24",
    path: <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />,
  },
  tickets: {
    viewBox: "0 0 24 24",
    path: (
      <path d="M15 5v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z" />
    ),
  },
  wallet: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 10h20" />
        <path d="M16 14h2" />
      </>
    ),
  },
  profile: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  },
  star: {
    viewBox: "0 0 24 24",
    path: <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />,
  },
  check: {
    viewBox: "0 0 24 24",
    path: <polyline points="20,6 9,17 4,12" />,
  },
  x: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ),
  },
  "chevron-right": {
    viewBox: "0 0 24 24",
    path: <polyline points="9,18 15,12 9,6" />,
  },
  "chevron-left": {
    viewBox: "0 0 24 24",
    path: <polyline points="15,18 9,12 15,6" />,
  },
  clock: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </>
    ),
  },
  camera: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </>
    ),
  },
  search: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
  },
  bell: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </>
    ),
  },
  shield: {
    viewBox: "0 0 24 24",
    path: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
  info: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </>
    ),
  },
  "arrow-right": {
    viewBox: "0 0 24 24",
    path: (
      <>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12,5 19,12 12,19" />
      </>
    ),
  },
  "arrow-up-right": {
    viewBox: "0 0 24 24",
    path: (
      <>
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7,7 17,7 17,17" />
      </>
    ),
  },
  "arrow-down-left": {
    viewBox: "0 0 24 24",
    path: (
      <>
        <line x1="17" y1="7" x2="7" y2="17" />
        <polyline points="17,17 7,17 7,7" />
      </>
    ),
  },
  upload: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17,8 12,3 7,8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </>
    ),
  },
  users: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </>
    ),
  },
  grid: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </>
    ),
  },
  activity: {
    viewBox: "0 0 24 24",
    path: <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />,
  },
  alert: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
  },
  dollar: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </>
    ),
  },
  "file-text": {
    viewBox: "0 0 24 24",
    path: (
      <>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </>
    ),
  },
  help: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
  },
  settings: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </>
    ),
  },
  mail: {
    viewBox: "0 0 24 24",
    path: (
      <>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </>
    ),
  },
};

export default function Icon({ name, size = 24, className, strokeWidth = 2, filled = false }: IconProps) {
  const icon = icons[name];
  if (!icon) return null;

  return (
    <svg
      className={cn("shrink-0", className)}
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? "0" : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icon.path}
    </svg>
  );
}
