import { Menu } from "lucide-react";

interface TopNavBarProps {
  onMenuClick: () => void;
}

export function TopNavBar({ onMenuClick }: TopNavBarProps) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-gray-100 rounded-md mr-4"
      >
        <Menu className="w-6 h-6" />
      </button>
      <h1 className="text-xl font-semibold text-gray-800">Mind Map Builder</h1>
      <div className="ml-auto flex items-center gap-4">
        <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
          Export
        </button>
        <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
          Settings
        </button>
      </div>
    </div>
  );
}
