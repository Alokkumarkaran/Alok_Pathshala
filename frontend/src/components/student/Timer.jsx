import { useEffect, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";

export default function Timer({ duration, onEnd }) {
  // Convert minutes to seconds
  const totalTime = duration * 60;
  const [timeLeft, setTimeLeft] = useState(totalTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onEnd();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onEnd]);

  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Calculate Progress Percentage
  const progress = (timeLeft / totalTime) * 100;

  // Dynamic Styling based on time remaining
  let colorClass = "text-indigo-700 bg-indigo-50 border-indigo-200";
  let progressColor = "bg-indigo-600";
  let icon = <Clock size={20} className="animate-pulse" />;

  // Warning (Less than 5 mins)
  if (timeLeft < 300 && timeLeft > 60) {
    colorClass = "text-yellow-700 bg-yellow-50 border-yellow-200";
    progressColor = "bg-yellow-500";
  } 
  // Critical (Less than 1 min)
  else if (timeLeft <= 60) {
    colorClass = "text-red-700 bg-red-50 border-red-200 animate-pulse";
    progressColor = "bg-red-600";
    icon = <AlertCircle size={20} className="animate-bounce" />;
  }

  return (
    <div className={`relative flex flex-col items-center justify-center px-4 py-2 rounded-xl border-2 shadow-sm transition-colors duration-300 w-full max-w-[180px] md:max-w-[220px] ${colorClass}`}>
      
      {/* Timer Display */}
      <div className="flex items-center gap-3 font-mono font-bold text-2xl md:text-3xl tracking-wider">
        {icon}
        <span>{formattedTime}</span>
      </div>

      {/* Label */}
      <span className="text-[10px] md:text-xs uppercase font-bold opacity-70 mt-1">
        Time Remaining
      </span>

      {/* Progress Bar Background */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-200 rounded-b-lg overflow-hidden">
        {/* Active Progress */}
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${progressColor}`} 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}