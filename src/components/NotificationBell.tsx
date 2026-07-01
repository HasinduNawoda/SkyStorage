import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box, Circle, Float, VisuallyHidden } from "@chakra-ui/react";
import bell from "../assets/icons/bell.png";
import ModalPortal from "./ModalPortal";
import NotificationItem from "./NotificationItem";
import NotificationsModal from "./NotificationsModal";
import { useNotifications } from "../hooks/useNotifications";

const RECENT_COUNT = 5;
const PANEL_WIDTH = 384; // px — matches the w-96 the panel used to render at
const VIEWPORT_MARGIN = 16;

export default function NotificationBell() {
  const { notifications, unseenCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [showAllOpen, setShowAllOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // The right-hand panel this bell lives in uses `overflow-y-auto`, which also
  // clips horizontal overflow. Rather than fight that, the dropdown is portaled
  // to <body> and positioned with `fixed` coordinates computed from the bell's
  // real screen position — so it always renders on top, uncropped.
  useLayoutEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const left = Math.min(rect.left, window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN);
      setPanelPos({ top: rect.bottom + 8, left: Math.max(VIEWPORT_MARGIN, left) });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  // Close on outside click — checks both the bell button and the portaled panel,
  // since they're no longer in the same place in the DOM tree.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedTrigger = triggerRef.current?.contains(target);
      const clickedPanel = panelRef.current?.contains(target);
      if (!clickedTrigger && !clickedPanel) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const recent = notifications.slice(0, RECENT_COUNT);

  return (
    <>
      <Box
        position="relative"
        ref={triggerRef}
        onClick={() => setOpen((prev) => !prev)}
        cursor="pointer"
      >
        <img src={bell} alt="Notifications" className="w-12 h-12 cursor-pointer" />

        {unseenCount > 0 && (
          <Float offset="2">
            <Circle size="5" bg="red.500" color="white" fontSize="xs">
              {unseenCount > 9 ? "9+" : unseenCount}
            </Circle>
          </Float>
        )}
        <VisuallyHidden>{unseenCount} notifications</VisuallyHidden>
      </Box>

      {open && panelPos && (
        <ModalPortal>
          <div
            ref={panelRef}
            style={{ position: "fixed", top: panelPos.top, left: panelPos.left, width: PANEL_WIDTH }}
            className="max-h-[28rem] bg-white rounded-xl shadow-xl border border-gray-200 z-50 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
              {unseenCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {recent.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-gray-400">
                  You're all caught up.
                </div>
              ) : (
                recent.map((n) => (
                  <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-2.5 text-center shrink-0">
                <button
                  onClick={() => {
                    setShowAllOpen(true);
                    setOpen(false);
                  }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  See all
                </button>
              </div>
            )}
          </div>
        </ModalPortal>
      )}

      {/* "See all" — shown on the current page with a blurred backdrop, not a separate route */}
      <NotificationsModal
        open={showAllOpen}
        onClose={() => setShowAllOpen(false)}
        notifications={notifications}
        onRead={markAsRead}
        onMarkAllRead={markAllAsRead}
        unseenCount={unseenCount}
      />
    </>
  );
}
