export function CalendarLegend() {
  return (
    <div className="flex items-center gap-5 text-xs text-gray-600 mt-3">
      <div className="flex items-center gap-2">
        <div className="w-4 h-0.5 rounded-full bg-rose-500"></div>
        <span>Booked</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-0.5 rounded-full bg-amber-500"></div>
        <span>Partial</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-0.5 rounded-full bg-slate-400"></div>
        <span>Blocked</span>
      </div>
    </div>
  );
} 