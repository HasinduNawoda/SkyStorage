import doc from "../assets/icons/doc.png";
import image from "../assets/icons/image.png";
import video from "../assets/icons/mp4.png";
import music from "../assets/icons/mp3.png";
import other from "../assets/icons/other.png";
import { useState } from "react";

export default function FilesBar() {
    const items = [
        { label: "Documents", icon: doc, count: 10 },
        { label: "Images", icon: image, count: 36 },
        { label: "Videos", icon: video, count: 5 },
        { label: "Music", icon: music, count: 18 },
        { label: "Other", icon: other, count: 7 },
    ];
    const [active, setActive] = useState<string | null>(null);
    return (
        <div className="flex gap-6 mt-14 mb-8">
            {items.map((item, idx) => {
                const isActive = active === item.label;
                // If no item is active, all are fully opaque. If one is active, only that is fully opaque.
                const opacityClass = active ? (isActive ? "opacity-100" : "opacity-80") : "opacity-100";
                return (
                    <button
                        key={idx}
                        onClick={() => setActive(item.label)}
                        className={`flex-1 flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200
                                   border border-gray-200 hover:bg-gray-300  hover:scale-110
                                   ${opacityClass} ${isActive ? "scale-110" : ""} hover:opacity-100`}
                    >
                        <img src={item.icon} className="w-6 h-6" />
                        <span className="text-sm font-medium text-gray-700">
                            {item.count} files
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
