import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import { Trophy, Medal, Search, Crown, User, AlertCircle, ChevronDown, Award } from "lucide-react";

export default function Leaderboard() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState("");
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTests, setLoadingTests] = useState(true);

  // 1. Fetch Tests
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await api.get("/test/admin/all");
        if (Array.isArray(res.data)) {
          setTests(res.data);
        } else if (res.data && Array.isArray(res.data.tests)) {
          setTests(res.data.tests);
        } else {
          setTests([]); 
        }
      } catch (error) {
        console.error("Failed to fetch tests:", error);
      } finally {
        setLoadingTests(false);
      }
    };
    fetchTests();
  }, []);

  const loadLeaderboard = (testId) => {
    setSelectedTest(testId);
    if (!testId) {
      setLeaders([]);
      return;
    }

    setLoading(true);
    api.get(`/exam/admin/leaderboard/${testId}`)
      .then((res) => {
        setLeaders(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  // Helper for Initials
  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : "?";
  
  // Random color for avatars
  const getAvatarColor = (i) => {
    const colors = ["bg-blue-100 text-blue-600", "bg-violet-100 text-violet-600", "bg-pink-100 text-pink-600", "bg-emerald-100 text-emerald-600"];
    return colors[i % colors.length];
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* === HEADER === */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl text-yellow-600 shadow-sm border border-yellow-200">
                <Trophy size={28} />
              </div>
              Leaderboard
            </h1>
            <p className="text-gray-500 mt-2 font-medium ml-1">Track top performers and student rankings across assessments.</p>
          </div>

          {/* Test Selector */}
          <div className="w-full lg:w-80 relative group">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block pl-1">Filter by Exam</label>
            <div className="relative">
              <select
                value={selectedTest}
                onChange={(e) => loadLeaderboard(e.target.value)}
                disabled={loadingTests}
                className="w-full pl-5 pr-10 py-3.5 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 appearance-none transition-all cursor-pointer shadow-sm hover:border-gray-300"
              >
                <option value="">-- Choose an Assessment --</option>
                {tests.map((t) => (
                  <option key={t._id} value={t._id}>{t.title}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 group-hover:text-indigo-500 transition-colors">
                <ChevronDown size={20} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        {/* === LOADING STATE === */}
        {loading && (
          <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center shadow-sm border border-gray-100 min-h-[400px]">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold text-gray-800">Calculating Rankings...</h3>
            <p className="text-gray-400">Crunching the scores for you.</p>
          </div>
        )}

        {/* === EMPTY STATE (No Test Selected) === */}
        {!loading && !selectedTest && (
          <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100 min-h-[400px] border-dashed">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Award size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Exam Selected</h3>
            <p className="text-gray-500 max-w-sm">Select an assessment from the dropdown above to view the podium.</p>
          </div>
        )}

        {/* === EMPTY STATE (Test Selected but No Data) === */}
        {!loading && selectedTest && leaders.length === 0 && (
          <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100 min-h-[400px]">
             <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
              <AlertCircle size={40} className="text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Yet</h3>
            <p className="text-gray-500">It looks like no students have taken this exam yet.</p>
          </div>
        )}

        {/* === LEADERBOARD CONTENT === */}
        {!loading && leaders.length > 0 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* 🏆 TOP 3 PODIUM */}
            {leaders.length >= 3 && (
              <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-6 mb-8 pt-8">
                
                {/* 2nd Place */}
                <div className="order-2 md:order-1 flex-1 max-w-[280px] w-full transform hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-[-20px] z-10">
                       <div className="w-20 h-20 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-600 shadow-lg">
                         {getInitials(leaders[1].studentId?.name)}
                       </div>
                       <div className="absolute -top-2 -right-2 bg-slate-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border-2 border-white">2nd</div>
                    </div>
                    <div className="bg-gradient-to-b from-white to-slate-50 w-full pt-10 pb-6 px-4 rounded-t-2xl shadow-xl border-t border-x border-slate-100 text-center relative overflow-hidden h-[200px] flex flex-col justify-end">
                      <div className="absolute top-0 left-0 w-full h-1 bg-slate-400"></div>
                      <h3 className="font-bold text-gray-800 truncate w-full mb-1">{leaders[1].studentId?.name}</h3>
                      <p className="text-slate-500 font-black text-2xl">{leaders[1].score}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Score</p>
                    </div>
                  </div>
                </div>

                {/* 1st Place (Winner) */}
                <div className="order-1 md:order-2 flex-1 max-w-[320px] w-full transform hover:-translate-y-3 transition-transform duration-300 z-20 -mt-12 md:mt-0">
                  <div className="flex flex-col items-center">
                    <Crown className="text-yellow-500 mb-2 fill-current drop-shadow-sm animate-bounce" size={40} />
                    <div className="relative mb-[-25px] z-10">
                       <div className="w-24 h-24 rounded-full border-4 border-white bg-yellow-50 flex items-center justify-center text-3xl font-bold text-yellow-600 shadow-xl ring-4 ring-yellow-400/20">
                         {getInitials(leaders[0].studentId?.name)}
                       </div>
                       <div className="absolute -bottom-3 inset-x-0 mx-auto w-max bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg border-2 border-white">WINNER</div>
                    </div>
                    <div className="bg-gradient-to-b from-white to-yellow-50 w-full pt-12 pb-8 px-4 rounded-t-3xl shadow-2xl border-t border-x border-yellow-100 text-center relative overflow-hidden h-[240px] flex flex-col justify-end">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-yellow-400"></div>
                      {/* Confetti Background Effect (CSS only) */}
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/confetti.png')] opacity-10"></div>
                      
                      <h3 className="font-bold text-gray-900 text-xl truncate w-full mb-1">{leaders[0].studentId?.name}</h3>
                      <p className="text-yellow-600 font-black text-4xl mb-1">{leaders[0].score}</p>
                      <p className="text-[10px] text-yellow-600/60 uppercase font-bold tracking-widest">Highest Score</p>
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="order-3 flex-1 max-w-[280px] w-full transform hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-[-20px] z-10">
                       <div className="w-20 h-20 rounded-full border-4 border-white bg-orange-50 flex items-center justify-center text-2xl font-bold text-orange-700 shadow-lg">
                         {getInitials(leaders[2].studentId?.name)}
                       </div>
                       <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border-2 border-white">3rd</div>
                    </div>
                    <div className="bg-gradient-to-b from-white to-orange-50 w-full pt-10 pb-6 px-4 rounded-t-2xl shadow-xl border-t border-x border-orange-100 text-center relative overflow-hidden h-[170px] flex flex-col justify-end">
                      <div className="absolute top-0 left-0 w-full h-1 bg-orange-400"></div>
                      <h3 className="font-bold text-gray-800 truncate w-full mb-1">{leaders[2].studentId?.name}</h3>
                      <p className="text-orange-600 font-black text-2xl">{leaders[2].score}</p>
                      <p className="text-[10px] text-orange-400 uppercase font-bold tracking-widest">Score</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 📝 FULL RANKING LIST */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/80 backdrop-blur flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-700 text-lg">All Participants</h3>
                  <span className="bg-white border border-gray-200 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-md">{leaders.length}</span>
                </div>
                <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Download CSV</button>
              </div>
              
              <div className="divide-y divide-gray-50">
                {leaders.map((l, index) => {
                  // Determine styles for top ranks in the list view too
                  let rankClass = "text-gray-500 bg-gray-100";
                  if (index === 0) rankClass = "text-yellow-700 bg-yellow-100 ring-2 ring-yellow-100";
                  if (index === 1) rankClass = "text-slate-700 bg-slate-200 ring-2 ring-slate-100";
                  if (index === 2) rankClass = "text-orange-800 bg-orange-100 ring-2 ring-orange-100";

                  return (
                    <div key={l._id} className="group flex items-center justify-between p-5 hover:bg-indigo-50/40 transition-colors cursor-default">
                      <div className="flex items-center gap-4 md:gap-6 w-full max-w-lg">
                        {/* Rank */}
                        <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-bold text-sm md:text-lg ${rankClass}`}>
                          {index + 1}
                        </div>
                        
                        {/* User Info */}
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ${index < 3 ? 'opacity-0 hidden md:flex' : getAvatarColor(index)}`}>
                            {/* Hide avatar for top 3 in list to reduce clutter, show for others */}
                            {getInitials(l.studentId?.name)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors truncate text-base">{l.studentId?.name || "Unknown"}</h4>
                            <p className="text-xs text-gray-400 hidden md:block flex items-center gap-1">
                              Completed {new Date(l.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right pl-4">
                        <span className="block text-xl md:text-2xl font-black text-gray-800 group-hover:text-indigo-600 transition-colors">{l.score}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Marks</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>
    </AdminLayout>
  );
}