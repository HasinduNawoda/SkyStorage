import ModalPortal from "./ModalPortal";
import NotificationItem from "./NotificationItem";
import type { AppNotification } from "../hooks/useNotifications";

type Props = {
  open: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onRead: (id: string) => void;
  onMarkAllRead: () => void;
  unseenCount: number;
};

export default function NotificationsModal({
  open,
  onClose,
  notifications,
  onRead,
  onMarkAllRead,
  unseenCount,
}: Props) {
  if (!open) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay — same blurred-background treatment used by ShareModal */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        {/* Modal box */}
        <div
          className="relative z-10 w-[32%] min-w-[380px] h-[80%] rounded-xl bg-white shadow-xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <button
              onClick={onClose}
              className="opacity-60 hover:opacity-100 transition p-1 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-gray-600">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {unseenCount > 0 && (
            <div className="flex justify-end px-6 pt-3 shrink-0">
              <button
                onClick={onMarkAllRead}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Mark all as read
              </button>
            </div>
          )}

          {/* Scrollable list of every notification */}
          <div className="flex-1 overflow-y-auto mt-2 divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="px-6 py-16 text-center text-sm text-gray-400">
                You're all caught up.
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} onRead={onRead} />
              ))
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
