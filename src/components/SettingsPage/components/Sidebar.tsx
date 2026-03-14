import React from "react";

type Props = {
  menuItems: string[];
  active: string;
  setActive: (item: string) => void;
};

export default function Sidebar({ menuItems, active, setActive }: Props) {
  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            className={`w-full text-left px-4 py-2 rounded-lg transition
              ${
                active === item
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}