import { useCallback, useMemo, useState, useEffect } from "react";
import { getSharesWithMe } from "../utils/api";

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

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    // 1. Load read status from localStorage
    const readIds = new Set<string>();
    try {
      const stored = localStorage.getItem("sky_notifications_read");
      if (stored) {
        JSON.parse(stored).forEach((id: string) => readIds.add(id));
      }
    } catch (e) {}

    // 2. Fetch real shares
    getSharesWithMe()
      .then((shares) => {
        const notifs: AppNotification[] = shares.map((s) => {
           const senderName = s.owner?.name || s.owner?.email || "Someone";
           const itemName = s.file?.name || s.folder?.name || "an item";
           const type = s.folder ? "folder" : "file";
           
           return {
             id: s.id,
             name: senderName,
             message: `${senderName} shared the ${type} "${itemName}" with you.`,
             createdAt: s.createdAt,
             read: readIds.has(s.id),
           };
        });
        
        // Sort descending by date
        notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(notifs);
      })
      .catch((err) => {
        console.error("Failed to load notifications:", err);
      });
  }, []);

  const unseenCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const persistRead = (newNotifs: AppNotification[]) => {
    const readIds = newNotifs.filter(n => n.read).map(n => n.id);
    localStorage.setItem("sky_notifications_read", JSON.stringify(readIds));
  };

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      persistRead(updated);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      persistRead(updated);
      return updated;
    });
  }, []);

  return { notifications, unseenCount, markAsRead, markAllAsRead };
}
