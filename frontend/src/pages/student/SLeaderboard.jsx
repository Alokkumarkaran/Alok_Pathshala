import { useEffect, useState } from "react";
import api from "../../api/axios";
import StudentLayout from "../../layouts/StudentLayout";
import { Medal, Crown, User, Trophy, Star } from "lucide-react";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure this endpoint exists in your backend
    api.get("/exam/leaderboard/global")
      .then((res) => setLeaders(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Helper to generate initials
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  // Helper to get random soft background color for avatar
  const getAvatarColor = (index) => {
    const colors = ["bg-blue-100 text-blue-600", "bg-purple-100 text-purple-600", "bg-pink-100 text-pink-600", "bg-green-100 text-green-600", "bg-orange-100 text-orange-600"];
    return colors[index % colors.length];
  };

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* === HEADER === */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-yellow-100 rounded-full mb-4 ring-4 ring-yellow-50">
            <Crown className="text-yellow-600" size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            Hall of Fame
          </h1>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            Celebrating the top achievers across all assessments. Keep learning to see your name here!
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading rankings...</p>
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Trophy size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">No Champions Yet</h3>
            <p className="text-gray-500">Be the first to take an exam and top the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* === TOP 3 PODIUM (Desktop Only) === */}
            {leaders.length >= 3 && (
              <div className="hidden md:flex justify-center items-end gap-6 mb-12">
                
                {/* 2nd Place */}
                <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-100">
                  <div className="w-20 h-20 rounded-full border-4 border-gray-200 bg-white shadow-lg flex items-center justify-center text-2xl font-bold text-gray-600 relative z-10 mb-[-10px]">
                    {getInitials(leaders[1]?.studentId?.name)}
                    <div className="absolute -top-3 bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">2nd</div>
                  </div>
                  <div className="bg-gradient-to-b from-gray-100 to-white w-32 h-40 rounded-t-2xl border border-gray-200 flex flex-col items-center justify-start pt-6 shadow-sm">
                    <p className="font-bold text-gray-800 truncate w-full text-center px-2">{leaders[1]?.studentId?.name}</p>
                    <p className="text-xs text-gray-500 mb-2 truncate max-w-[90%]">{leaders[1]?.testId?.title}</p>
                    <span className="font-black text-2xl text-gray-700">{leaders[1]?.score}</span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700">
                  <Crown className="text-yellow-400 mb-2 drop-shadow-sm" size={40} fill="currentColor" />
                  <div className="w-24 h-24 rounded-full border-4 border-yellow-400 bg-white shadow-xl flex items-center justify-center text-3xl font-bold text-yellow-600 relative z-10 mb-[-10px]">
                    {getInitials(leaders[0]?.studentId?.name)}
                    <div className="absolute -top-3 bg-yellow-400 text-white text-xs font-bold px-3 py-0.5 rounded-full shadow-md">1st</div>
                  </div>
                  <div className="bg-gradient-to-b from-yellow-50 to-white w-40 h-52 rounded-t-2xl border border-yellow-200 flex flex-col items-center justify-start pt-8 shadow-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-yellow-400 opacity-5"></div>
                    <p className="font-bold text-gray-900 text-lg truncate w-full text-center px-2">{leaders[0]?.studentId?.name}</p>
                    <p className="text-xs text-gray-500 mb-2 truncate max-w-[90%]">{leaders[0]?.testId?.title}</p>
                    <span className="font-black text-4xl text-yellow-600">{leaders[0]?.score}</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-200">
                  <div className="w-20 h-20 rounded-full border-4 border-orange-200 bg-white shadow-lg flex items-center justify-center text-2xl font-bold text-orange-600 relative z-10 mb-[-10px]">
                    {getInitials(leaders[2]?.studentId?.name)}
                    <div className="absolute -top-3 bg-orange-200 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">3rd</div>
                  </div>
                  <div className="bg-gradient-to-b from-orange-50 to-white w-32 h-32 rounded-t-2xl border border-orange-200 flex flex-col items-center justify-start pt-6 shadow-sm">
                    <p className="font-bold text-gray-800 truncate w-full text-center px-2">{leaders[2]?.studentId?.name}</p>
                    <p className="text-xs text-gray-500 mb-2 truncate max-w-[90%]">{leaders[2]?.testId?.title}</p>
                    <span className="font-black text-2xl text-orange-700">{leaders[2]?.score}</span>
                  </div>
                </div>

              </div>
            )}

            {/* === FULL LIST === */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">All Top Performers</h3>
                <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                  Top {leaders.length}
                </span>
              </div>
              
              <div className="divide-y divide-gray-50">
                {leaders.map((entry, index) => {
                  let rankStyles = "bg-gray-100 text-gray-500"; // Default
                  let icon = null;

                  if (index === 0) {
                    rankStyles = "bg-yellow-100 text-yellow-700 ring-2 ring-yellow-50";
                    icon = <Crown size={14} fill="currentColor" />;
                  } else if (index === 1) {
                    rankStyles = "bg-gray-200 text-gray-700 ring-2 ring-gray-50";
                  } else if (index === 2) {
                    rankStyles = "bg-orange-100 text-orange-800 ring-2 ring-orange-50";
                  }

                  return (
                    <div 
                      key={entry._id} 
                      className="flex items-center p-4 sm:p-5 hover:bg-gray-50 transition-colors group"
                    >
                      {/* Rank Number */}
                      <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg mr-4 sm:mr-6 ${rankStyles}`}>
                        {index + 1}
                      </div>

                      {/* Avatar & Name */}
                      <div className="flex-1 min-w-0 flex items-center gap-3 sm:gap-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-sm sm:text-lg font-bold ${getAvatarColor(index)}`}>
                          {getInitials(entry.studentId?.name)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 truncate flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                            {entry.studentId?.name || "Unknown User"}
                            {icon}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-500 truncate flex items-center gap-1">
                            <span className="hidden sm:inline">Excellence in</span> 
                            <span className="font-medium text-gray-600">{entry.testId?.title}</span>
                          </p>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="text-right pl-4">
                        <div className="flex flex-col items-end">
                          <span className="text-xl sm:text-2xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {entry.score}
                          </span>
                          <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                            Score
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>
    </StudentLayout>
  );
}