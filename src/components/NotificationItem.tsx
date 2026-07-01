import { Avatar } from "@chakra-ui/react";
import { formatDate } from "../utils/formatDate";
import type { AppNotification } from "../hooks/useNotifications";

// Same deterministic palette-picking approach used in MembersAvatars.tsx,
// so avatar fallback colors stay consistent across the app.
const colorPalette = ["red", "blue", "green", "yellow", "purple", "orange", "teal", "pink"];
const pickPalette = (name: string) => colorPalette[name.charCodeAt(0) % colorPalette.length];

type Props = {
  notification: AppNotification;
  onRead: (id: string) => void;
};

export default function NotificationItem({ notification, onRead }: Props) {
  const { id, name, avatarUrl, message, createdAt, read } = notification;

  return (
    <button
      onClick={() => !read && onRead(id)}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition ${
        read ? "bg-white hover:bg-gray-50" : "bg-blue-50/50 hover:bg-blue-50"
      }`}
    >
      <Avatar.Root size="md" colorPalette={pickPalette(name)} className="shrink-0">
        {avatarUrl && <Avatar.Image src={avatarUrl} alt={name} />}
        <Avatar.Fallback name={name} />
      </Avatar.Root>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug">{message}</p>
        <span className="text-xs text-gray-400 mt-1 inline-block">{formatDate(createdAt)}</span>
      </div>

      {/* Unread indicator — removed automatically once the item is read */}
      <span
        aria-hidden="true"
        className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${read ? "bg-transparent" : "bg-blue-500"}`}
      />
    </button>
  );
}
