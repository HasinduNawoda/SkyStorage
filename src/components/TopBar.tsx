import search from "../assets/icons/search.png";
import plus from "../assets/icons/plus.png";


export default function TopBar() {
  return (
    <div className="flex items-center gap-10 mb-6">
      {/* Search bar */}
      <div className="relative flex-1 h-14">
        <img
          src={search}
          alt="Search"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60"
        />

        <input
          type="text"
          placeholder="Search files and folders"
          className="w-full h-full pl-10 pr-4 rounded border border-gray-300 text-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Button */}
      <button
        className="h-14 flex items-center bg-blue-500 text-white text-lg px-6
                   rounded hover:bg-blue-600 transition"
      >
        <img src={plus} alt="Upload" className="w-6 h-6 mr-2" />
        Create New
      </button>
    </div>
  );
}
