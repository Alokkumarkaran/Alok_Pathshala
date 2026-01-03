import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import StudentLayout from "../../layouts/StudentLayout";
import { 
  Crown, 
  Medal, 
  Search, 
  Trophy, 
  ArrowUpRight, 
  Calendar,
  Filter,
  User
} from "lucide-react";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await api.get("/exam/leaderboard/global");
        setLeaders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  // --- FILTERING & SEARCHING ---
  const filteredLeaders = useMemo(() => {
    return leaders.filter(l => 
      l.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.testId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leaders, searchTerm]);

  const topThree = filteredLeaders.slice(0, 3);
  const restOfList = filteredLeaders.slice(3);

  // --- HELPERS ---
  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : "?";
  
  // Professional Gradients for Ranks
  const getRankBadge = (index) => {
    switch(index) {
      case 0: return "bg-gradient-to-br from-yellow-300 to-yellow-500 text-white shadow-yellow-200";
      case 1: return "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-slate-200";
      case 2: return "bg-gradient-to-br from-orange-300 to-orange-500 text-white shadow-orange-200";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gray-50/30 pb-12">
        
        {/* === HEADER SECTION === */}
        <div className="bg-white border-b border-gray-200 pt-4 pb-12 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                <Trophy className="text-indigo-600" size={32} />
                Global Leaderboard
              </h1>
              <p className="text-gray-500 mt-2 text-lg">
                Recognizing top performers across the platform.
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search student..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              
              {/* Filter */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Calendar size={18} />
                </div>
                <select 
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="w-full sm:w-40 pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <option value="all">All Time</option>
                  <option value="month">This Month</option>
                  <option value="week">This Week</option>
                </select>
                <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6">
          
          {/* === LOADING SKELETON === */}
          {loading && (
            <div className="animate-pulse space-y-4">
              <div className="flex gap-4 justify-center items-end h-48 mb-8">
                <div className="w-1/3 h-32 bg-gray-200 rounded-t-xl"></div>
                <div className="w-1/3 h-48 bg-gray-200 rounded-t-xl"></div>
                <div className="w-1/3 h-24 bg-gray-200 rounded-t-xl"></div>
              </div>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-16 bg-white rounded-xl w-full"></div>
              ))}
            </div>
          )}

          {!loading && leaders.length > 0 && (
            <>
              {/* === TOP 3 PODIUM (Responsive Grid) === */}
              {/* Only show podium if no search active, or search matches top 3 */}
              {!searchTerm && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-end">
                  
                  {/* Rank 2 */}
                  <div className="order-2 md:order-1 relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow">
                    <div className="absolute -top-4 bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full border border-white shadow-sm text-sm">
                      #2 Silver
                    </div>
                    <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xl font-bold mb-3 ring-4 ring-white">
                      {getInitials(leaders[1]?.studentId?.name)}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg truncate w-full text-center">{leaders[1]?.studentId?.name}</h3>
                    <p className="text-slate-500 text-sm mb-4">{leaders[1]?.testId?.title}</p>
                    <div className="w-full bg-slate-50 rounded-lg py-2 text-center border border-slate-100">
                      <span className="text-xl font-black text-slate-700">{leaders[1]?.score}</span>
                      <span className="text-xs text-slate-400 ml-1">pts</span>
                    </div>
                  </div>

                  {/* Rank 1 */}
                  <div className="order-1 md:order-2 relative bg-white rounded-2xl p-8 shadow-xl shadow-yellow-500/10 border border-yellow-100 flex flex-col items-center z-10 scale-105 transform">
                    <div className="absolute -top-6">
                      <Crown className="text-yellow-400 drop-shadow-sm" size={48} fill="currentColor" />
                    </div>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-50 text-yellow-600 flex items-center justify-center text-3xl font-bold mb-4 ring-4 ring-white shadow-lg">
                      {getInitials(leaders[0]?.studentId?.name)}
                    </div>
                    <h3 className="font-bold text-gray-900 text-xl truncate w-full text-center">{leaders[0]?.studentId?.name}</h3>
                    <p className="text-yellow-600/70 text-sm font-semibold mb-4 tracking-wide uppercase">Champion</p>
                    <div className="w-full bg-yellow-50 rounded-xl py-3 text-center border border-yellow-100">
                      <span className="text-3xl font-black text-yellow-600">{leaders[0]?.score}</span>
                      <span className="text-sm text-yellow-600/60 ml-1 font-bold">pts</span>
                    </div>
                  </div>

                  {/* Rank 3 */}
                  <div className="order-3 md:order-3 relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow">
                     <div className="absolute -top-4 bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full border border-white shadow-sm text-sm">
                      #3 Bronze
                    </div>
                    <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-xl font-bold mb-3 ring-4 ring-white">
                      {getInitials(leaders[2]?.studentId?.name)}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg truncate w-full text-center">{leaders[2]?.studentId?.name}</h3>
                    <p className="text-orange-500/70 text-sm mb-4">{leaders[2]?.testId?.title}</p>
                    <div className="w-full bg-orange-50 rounded-lg py-2 text-center border border-orange-100">
                      <span className="text-xl font-black text-orange-700">{leaders[2]?.score}</span>
                      <span className="text-xs text-orange-400 ml-1">pts</span>
                    </div>
                  </div>

                </div>
              )}

              {/* === MAIN LIST === */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        <th className="px-6 py-4 w-20 text-center">Rank</th>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Assessment</th>
                        <th className="px-6 py-4 text-right">Score</th>
                        <th className="px-6 py-4 text-right hidden sm:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(searchTerm ? filteredLeaders : restOfList).map((entry, index) => {
                        // Calculate actual rank based on if we are showing full list or just rest
                        const actualRank = searchTerm ? index + 1 : index + 4;
                        
                        return (
                          <tr key={entry._id} className="hover:bg-indigo-50/30 transition-colors group">
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                actualRank <= 3 ? getRankBadge(actualRank-1) : "text-gray-500 bg-gray-100"
                              }`}>
                                {actualRank}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                  {getInitials(entry.studentId?.name)}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                    {entry.studentId?.name}
                                  </div>
                                  <div className="text-xs text-gray-400 sm:hidden">{entry.testId?.title}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 font-medium hidden sm:table-cell">
                              {entry.testId?.title}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="inline-flex flex-col items-end">
                                <span className="font-bold text-gray-900 tabular-nums">{entry.score}</span>
                                <span className="text-[10px] text-green-600 flex items-center font-medium bg-green-50 px-1.5 rounded">
                                  <ArrowUpRight size={10} className="mr-0.5" /> Top 5%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-sm text-gray-400 tabular-nums hidden sm:table-cell">
                              {new Date().toLocaleDateString()} {/* Replace with actual date if available */}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Empty Search Result */}
                {filteredLeaders.length === 0 && (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-gray-900 font-medium">No students found</h3>
                    <p className="text-gray-500 text-sm">Try adjusting your search query.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* === EMPTY STATE (No Data) === */}
          {!loading && leaders.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <Trophy size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">Leaderboard Empty</h3>
              <p className="text-gray-500">Be the first to complete an assessment and take the crown!</p>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}