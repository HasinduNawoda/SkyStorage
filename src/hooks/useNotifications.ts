import { useCallback, useMemo, useState } from "react";

export type AppNotification = {
  id: string;
  /** Person or system name — used for the avatar fallback initials */
  name: string;
  /** Optional profile picture. Falls back to initials avatar when absent */
  avatarUrl?: string;
  /** Notification text, already fully composed (e.g. "Alex shared a file with you.") */
  message: string;
  /** ISO date string — when the notification was received */
  createdAt: string;
  read: boolean;
};

// Seed data — 3 unread items so the bell badge starts at "3" as requested.
const initialNotifications: AppNotification[] = [
  {
    id: "n1",
    name: "Alex Kim",
    message: "Alex Kim shared \"design_assets.zip\" with you.",
    createdAt: "2026-07-01T14:20:00Z",
    read: false,
  },
  {
    id: "n2",
    name: "Nina Fernando",
    message: "Nina Fernando commented on \"Q4_Report_Final.pdf\".",
    createdAt: "2026-07-01T09:05:00Z",
    read: false,
  },
  {
    id: "n3",
    name: "Priya Sharma",
    message: "Priya Sharma invited you to the \"Team Projects\" folder.",
    createdAt: "2026-06-30T18:42:00Z",
    read: false,
  },
  {
    id: "n4",
    name: "SkyStorage",
    message: "Your upload \"backup_march2026.zip\" completed successfully.",
    createdAt: "2026-06-29T11:15:00Z",
    read: true,
  },
  {
    id: "n5",
    name: "Devon Clarke",
    message: "Devon Clarke edited \"Roadmap_2026.docx\".",
    createdAt: "2026-06-28T08:30:00Z",
    read: true,
  },
  {
    id: "n6",
    name: "SkyStorage",
    message: "Your storage usage reached 80% of your plan.",
    createdAt: "2026-06-26T16:00:00Z",
    read: true,
  },
  {
    id: "n7",
    name: "Maria Lopez",
    message: "Maria Lopez requested access to \"Client Contracts\".",
    createdAt: "2026-06-24T13:10:00Z",
    read: true,
  },
  {
    id: "n8",
    name: "SkyStorage",
    message: "A new device signed in to your account.",
    createdAt: "2026-06-22T07:48:00Z",
    read: true,
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  const unseenCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return { notifications, unseenCount, markAsRead, markAllAsRead };
}
