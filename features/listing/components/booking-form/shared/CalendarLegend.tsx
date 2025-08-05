export function CalendarLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
      <div className="flex items-center gap-1">
        <div className="w-3 h-0.5 bg-red-500"></div>
        <span>Fully Booked</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-0.5 bg-yellow-500"></div>
        <span>Partially Booked</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-0.5 bg-blue-500"></div>
        <span>Blocked</span>
      </div>
    </div>
  );
} 