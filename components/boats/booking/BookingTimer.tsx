import { Timer } from "lucide-react";

interface BookingTimerProps {
  timeLeft: number;
}

export default function BookingTimer({ timeLeft }: BookingTimerProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = ((600 - timeLeft) / 600) * 100;
  const isUrgent = timeLeft < 120; // Less than 2 minutes

  return (
    <div className="text-center py-2">
      <div className="inline-flex items-center space-x-3 px-5 py-2 rounded-full bg-white/80 backdrop-blur-sm">
        <div className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-red-500 animate-pulse' : 'bg-coral-500'}`} />
        <span className="text-sm text-gray-600">Hold expires in</span>
        <span className={`font-mono font-semibold ${isUrgent ? 'text-red-600' : 'text-coral-600'}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full max-w-xs mx-auto mt-4">
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${isUrgent ? 'bg-red-500' : 'bg-coral-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
} 