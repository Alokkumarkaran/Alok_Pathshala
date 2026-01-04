import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import { 
  Trophy, Medal, Search, Crown, Users, TrendingUp, 
  Calendar, Star, ChevronDown, Award 
} from "lucide-react";

export default function Leaderboard() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState("");
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api.get("/test/admin/all").then((res) => {
      const data = Array.isArray(res.data) ? res.data : res.data.tests || [];
      setTests(data);
    });
  }, []);

  const loadLeaderboard = async (testId) => {
    setSelectedTest(testId);
    if (!testId) return setLeaders([]);
    
    setLoading(true);
    try {
      const res = await api.get(`/exam/admin/leaderboard/${testId}`);
      setLeaders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!leaders.length) return null;
    const scores = leaders.map(l => l.score);
    return {
      total: leaders.length,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      high: Math.max(...scores),
      top10Threshold: scores.sort((a,b) => b-a)[Math.ceil(scores.length * 0.1) - 1] || 0
    };
  }, [leaders]);

  const filteredList = leaders.filter(l => 
    l.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2 md:py-8 min-h-screen space-y-4 md:space-y-8 bg-gray-50/30">
        
       
{/* === HEADER === */}
<div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-white border border-orange-100 rounded-3xl p-6 lg:p-8 mb-10 shadow-sm">
  
  {/* Decorative background blob */}
  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-orange-100/50 blur-3xl pointer-events-none"></div>

  <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
    
    {/* Title Section */}
    <div className="flex items-start gap-4">
      <div className="hidden md:flex shrink-0 p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg shadow-orange-200 text-white transform rotate-3">
        <Trophy size={32} strokeWidth={2.5} />
      </div>
      
      <div>
        <div className="flex items-center gap-2 mb-1">
             <Medal size={16} className="text-orange-500" />
             <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">Hall of Fame</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          Exam Leaderboard
        </h1>
        <p className="text-gray-500 mt-2 font-medium max-w-md text-lg">
          Celebrate top performers. Analyze ranking distributions and scores.
        </p>
      </div>
    </div>

    {/* Controls Section */}
    <div className="w-full lg:w-96">
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 ml-1">
        Select Assessment
      </label>
      <div className="relative group">
        <select
          value={selectedTest}
          onChange={(e) => loadLeaderboard(e.target.value)}
          className="w-full appearance-none bg-white border-2 border-orange-100 hover:border-orange-300 text-gray-900 py-4 pl-5 pr-12 rounded-2xl text-base font-bold shadow-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all cursor-pointer outline-none"
        >
          <option value="">-- Choose an Exam --</option>
          {tests.map((t) => (
            <option key={t._id} value={t._id}>{t.title}</option>
          ))}
        </select>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500 bg-orange-50 p-1 rounded-md">
            <ChevronDown size={20} strokeWidth={3} />
        </div>
      </div>
    </div>
  </div>
</div>

        {/* === MAIN CONTENT === */}
        <AnimatePresence mode="wait">
          {!selectedTest ? (
            <EmptyState key="empty" />
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 md:space-y-10"
            >
              
              {/* STATS GRID: 2 Cols Mobile, 4 Cols Desktop */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <StatItem label="Participants" value={stats.total} icon={Users} color="blue" />
                  <StatItem label="Avg Score" value={stats.avg} icon={TrendingUp} color="indigo" />
                  <StatItem label="High Score" value={stats.high} icon={Crown} color="yellow" />
                  <StatItem label="Top 10%" value={`> ${stats.top10Threshold}`} icon={Star} color="purple" />
                </div>
              )}

              {loading ? (
                 <LoadingSkeleton />
              ) : leaders.length === 0 ? (
                 <NoDataState />
              ) : (
                <>
                  {/* === PODIUM (Responsive) === */}
                  <div className="relative pt-6 md:pt-10 pb-8 md:pb-12">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-indigo-500/5 blur-[60px] md:blur-[100px] rounded-full pointer-events-none"></div>
                     
                     <div className="flex flex-row justify-center items-end gap-2 md:gap-8 perspective-1000 px-2">
                        {leaders[1] && <PodiumCard rank={2} user={leaders[1]} delay={0.2} />}
                        {leaders[0] && <PodiumCard rank={1} user={leaders[0]} delay={0} />}
                        {leaders[2] && <PodiumCard rank={3} user={leaders[2]} delay={0.4} />}
                     </div>
                  </div>

                  {/* === RANKING LIST === */}
                  <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    {/* List Header */}
                    <div className="p-4 md:p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-center gap-3">
                      <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                        <input 
                          type="text" 
                          placeholder="Search student..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-white border border-gray-200 rounded-xl text-sm md:text-base font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider hidden sm:block">
                        Full Rankings
                      </div>
                    </div>

                    <div className="divide-y divide-gray-50">
                      {filteredList.slice(3).map((l, idx) => (
                        <ListRow key={l._id || idx} user={l} rank={idx + 4} />
                      ))}
                      {filteredList.length <= 3 && leaders.length > 3 && (
                        <div className="p-8 md:p-12 text-center text-gray-400 text-sm italic">
                          No matches found.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}

/* ================= SUB-COMPONENTS ================= */

const StatItem = ({ label, value, icon: Icon, color }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    yellow: "bg-amber-50 text-amber-600 ring-amber-100",
    purple: "bg-purple-50 text-purple-600 ring-purple-100",
  };
  return (
    <div className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 md:gap-4">
      <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ring-2 md:ring-4 ${styles[color]}`}>
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div>
        <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg md:text-2xl font-black text-gray-900">{value}</p>
      </div>
    </div>
  );
};

const PodiumCard = ({ rank, user, delay }) => {
  const isFirst = rank === 1;
  const colors = {
    1: { bg: "bg-gradient-to-b from-yellow-300 to-amber-500", shadow: "shadow-amber-500/40" },
    2: { bg: "bg-gradient-to-b from-slate-200 to-slate-400", shadow: "shadow-slate-400/40" },
    3: { bg: "bg-gradient-to-b from-orange-200 to-orange-400", shadow: "shadow-orange-400/40" },
  };
  const theme = colors[rank];
  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${user.studentId?.name}&backgroundColor=${isFirst ? 'fbbf24' : rank===2 ? '94a3b8' : 'fb923c'}`;

  // Responsive Height Classes
  const heightClass = isFirst ? 'h-48 md:h-64' : rank === 2 ? 'h-36 md:h-52' : 'h-28 md:h-44';
  const widthClass = 'w-1/3 max-w-[120px] md:max-w-[240px]';

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 120 }}
      className={`relative flex flex-col items-center ${widthClass} ${isFirst ? '-mt-8 md:-mt-12 z-20' : 'z-10'}`}
    >
      {isFirst && (
        <motion.div 
          animate={{ y: [0, -8, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-10 md:-top-14 text-yellow-500 drop-shadow-lg"
        >
          <Crown className="w-8 h-8 md:w-12 md:h-12" fill="currentColor" />
        </motion.div>
      )}

      {/* Avatar */}
      <div className={`relative z-20 mb-[-1.5rem] md:mb-[-2rem] transition-transform duration-300`}>
        <div className={`w-14 h-14 md:w-24 md:h-24 rounded-full border-[3px] md:border-4 border-white shadow-xl overflow-hidden bg-white ${theme.shadow}`}>
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <div className={`absolute -bottom-2 md:-bottom-2 left-1/2 -translate-x-1/2 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-black text-white bg-gray-900 border-2 border-white shadow-lg`}>
          #{rank}
        </div>
      </div>

      {/* Bar */}
      <div className={`w-full rounded-t-2xl md:rounded-t-3xl pt-10 md:pt-14 pb-2 md:pb-6 px-1 md:px-4 text-center ${theme.bg} ${theme.shadow} shadow-2xl relative overflow-hidden ${heightClass}`}>
        <div className="absolute inset-0 bg-white/10 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between pb-2">
          <h3 className={`font-bold text-white text-xs md:text-lg truncate drop-shadow-md px-1`}>
            {user.studentId?.name.split(" ")[0]}
          </h3>
          <div className="inline-block bg-white/20 backdrop-blur-md rounded-lg md:rounded-xl px-2 md:px-4 py-0.5 md:py-1 border border-white/40 shadow-inner mx-auto">
             <span className="text-lg md:text-2xl font-black text-white drop-shadow-sm">{user.score}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ListRow = ({ user, rank }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="group flex items-center justify-between p-4 md:p-5 hover:bg-indigo-50/50 transition-colors"
    >
      <div className="flex items-center gap-3 md:gap-6">
        <span className="font-bold text-gray-400 w-6 md:w-8 text-center text-sm md:text-lg">#{rank}</span>
        
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden group-hover:ring-2 ring-indigo-200 transition-all">
            <img 
              src={`https://api.dicebear.com/9.x/initials/svg?seed=${user.studentId?.name}`} 
              alt="" 
              className="w-full h-full" 
            />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm md:text-base group-hover:text-indigo-700 transition-colors truncate max-w-[120px] sm:max-w-none">
              {user.studentId?.name || "Unknown"}
            </h4>
            {/* Hide Date on Mobile */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
               <Calendar size={10} />
               {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="font-black text-lg md:text-xl text-gray-800 group-hover:text-indigo-600 transition-colors">
          {user.score}
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState = () => (
  <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 md:p-24 flex flex-col items-center justify-center text-center opacity-60">
    <Award className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mb-4 md:mb-6" />
    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Leaderboard Awaits</h3>
    <p className="text-sm md:text-base text-gray-500">Select an assessment above.</p>
  </div>
);

const NoDataState = () => (
  <div className="flex flex-col items-center justify-center py-12 md:py-20 bg-white rounded-3xl border border-gray-100">
    <div className="bg-orange-50 p-4 rounded-full mb-4">
      <Star className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
    </div>
    <h3 className="text-lg md:text-xl font-bold text-gray-800">Be the first!</h3>
    <p className="text-sm md:text-base text-gray-500">No submissions yet.</p>
  </div>
);

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-8">
     <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-20 md:h-24 bg-gray-200 rounded-xl md:rounded-2xl"></div>)}
     </div>
     <div className="h-48 md:h-64 bg-gray-200 rounded-3xl opacity-50"></div>
     <div className="space-y-2">
        {[1,2,3].map(i => <div key={i} className="h-14 md:h-16 bg-gray-200 rounded-xl"></div>)}
     </div>
  </div>
);