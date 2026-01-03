import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import { 
  Users, FileText, Activity, Plus, Trophy, ArrowRight, 
  TrendingUp, Calendar, Download, RefreshCcw, Filter,
  PieChart as PieIcon, BarChart3
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';

export default function AdminDashboard() {
  const [rawData, setRawData] = useState({ tests: [], results: [] });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all"); // 'week', 'month', 'all'
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch Data Function
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [testsRes, resultsRes] = await Promise.all([
        api.get("/test/admin/all"),
        api.get("/exam/admin/results")
      ]);
      
      setRawData({
        tests: Array.isArray(testsRes.data) ? testsRes.data : testsRes.data.tests || [],
        results: resultsRes.data
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  // Process Data based on Filters (useMemo for performance)
  const dashboardData = useMemo(() => {
    let filteredResults = [...rawData.results];

    // Simulate Date Filtering (Logic can be adjusted based on real needs)
    const now = new Date();
    if (timeRange === "week") {
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
      filteredResults = filteredResults.filter(r => new Date(r.createdAt) >= oneWeekAgo);
    } else if (timeRange === "month") {
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filteredResults = filteredResults.filter(r => new Date(r.createdAt) >= oneMonthAgo);
    }

    const uniqueStudents = new Set(filteredResults.map(r => r.studentId?._id).filter(Boolean));
    
    // Calculate Pass/Fail for Pie Chart
    let passed = 0;
    let failed = 0;
    filteredResults.forEach(r => {
      if (r.score >= (r.testId?.passingMarks || 0)) passed++;
      else failed++;
    });

    // Prepare Bar Chart Data
    const barData = filteredResults.slice(0, 10).reverse().map((r, i) => ({
      name: r.studentId?.name?.split(" ")[0] || `User ${i}`,
      fullName: r.studentId?.name,
      score: r.score,
      exam: r.testId?.title,
      date: new Date(r.createdAt).toLocaleDateString()
    }));

    return {
      stats: {
        activeTests: rawData.tests.length,
        totalAttempts: filteredResults.length,
        uniqueStudents: uniqueStudents.size,
        passRate: filteredResults.length > 0 ? Math.round((passed / filteredResults.length) * 100) : 0
      },
      pieData: [
        { name: 'Passed', value: passed, color: '#10b981' }, // Emerald-500
        { name: 'Failed', value: failed, color: '#ef4444' }  // Red-500
      ],
      barData,
      recentResults: filteredResults.slice(0, 5)
    };
  }, [rawData, timeRange]);

  // Animation Variants
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } }};
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 }};

  return (
    <AdminLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 bg-gray-50/50 min-h-screen"
      >
        
        {/* ================= HEADER & CONTROLS ================= */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-2 font-medium">Overview of assessment performance and student activity.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             {/* Time Filter */}
             <div className="bg-white border border-gray-200 rounded-lg p-1 flex shadow-sm">
                {['all', 'month', 'week'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeRange(t)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${
                      timeRange === t ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {t === 'all' ? 'All Time' : `This ${t}`}
                  </button>
                ))}
             </div>

             <button onClick={handleRefresh} className={`p-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition shadow-sm ${isRefreshing ? 'animate-spin' : ''}`}>
               <RefreshCcw size={18} />
             </button>

             <Link to="/admin/create-test">
               <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 font-bold text-sm">
                 <Plus size={18} /> New Exam
               </button>
             </Link>
          </div>
        </motion.div>

        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard 
            title="Total Students" value={dashboardData.stats.uniqueStudents} 
            icon={Users} color="blue" trend="+12%" trendUp={true} loading={loading} 
          />
          <StatCard 
            title="Total Attempts" value={dashboardData.stats.totalAttempts} 
            icon={FileText} color="indigo" trend="+5%" trendUp={true} loading={loading} 
          />
          <StatCard 
            title="Avg. Pass Rate" value={`${dashboardData.stats.passRate}%`} 
            icon={Activity} color="emerald" trend="-2%" trendUp={false} loading={loading} 
          />
          <StatCard 
            title="Active Exams" value={dashboardData.stats.activeTests} 
            icon={PieIcon} color="purple" trend="Stable" trendUp={true} loading={loading} 
          />
        </div>

        {/* ================= CHARTS SECTION ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Bar Chart (2/3) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                 <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                   <BarChart3 size={20} className="text-indigo-500" /> Score Distribution
                 </h3>
                 <p className="text-xs text-gray-400">Recent student performance scores</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              {loading ? <ChartSkeleton /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={50}>
                      {dashboardData.barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score >= 50 ? '#6366f1' : '#f87171'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Pie Chart (1/3) */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Pass vs Fail Ratio</h3>
            <div className="flex-1 flex items-center justify-center relative">
               {loading ? <div className="animate-pulse w-32 h-32 rounded-full bg-gray-100"></div> : (
                 <ResponsiveContainer width="100%" height={250}>
                   <PieChart>
                     <Pie
                       data={dashboardData.pieData}
                       cx="50%" cy="50%"
                       innerRadius={60} outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {dashboardData.pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <Tooltip />
                   </PieChart>
                 </ResponsiveContainer>
               )}
               {/* Center Text Overlay */}
               {!loading && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-3xl font-black text-gray-800">{dashboardData.stats.totalAttempts}</span>
                   <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total</span>
                 </div>
               )}
            </div>
            <div className="flex justify-center gap-6 mt-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-medium text-gray-600">Passed</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-gray-600">Failed</span>
               </div>
            </div>
          </motion.div>
        </div>

        {/* ================= RECENT ACTIVITY TABLE ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <motion.div variants={itemVariants} className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                Recent Submissions
              </h3>
              <Link to="/admin/results" className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-colors">
                View All Results
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Assessment</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                     [...Array(5)].map((_, i) => <TableSkeleton key={i} />)
                  ) : dashboardData.recentResults.length === 0 ? (
                    <tr><td colSpan="4" className="p-8 text-center text-gray-400">No data found within this range.</td></tr>
                  ) : (
                    dashboardData.recentResults.map((r) => {
                      const isPassed = r.score >= (r.testId?.passingMarks || 0);
                      return (
                        <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                {r.studentId?.name?.charAt(0)}
                              </div>
                              <span className="text-sm font-semibold text-gray-700">{r.studentId?.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{r.testId?.title}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold border ${
                              isPassed ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                            }`}>
                              {isPassed ? "Passed" : "Failed"} • {r.score}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-xs text-gray-400">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ================= LEADERBOARD MINI-WIDGET ================= */}
          <motion.div variants={itemVariants} className="bg-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden flex flex-col justify-between">
             <div className="relative z-10">
                <Trophy className="w-10 h-10 text-yellow-400 mb-4" />
                <h3 className="text-xl font-bold mb-1">Weekly Top 3</h3>
                <p className="text-indigo-200 text-sm mb-6">Highest scoring students this week.</p>
                
                <div className="space-y-4 mb-6">
                  {/* Mock Top 3 - In real app, sort by score */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                       <span className="font-bold text-yellow-400">#{i}</span>
                       <div className="w-6 h-6 rounded-full bg-indigo-500"></div>
                       <div className="h-2 w-16 bg-indigo-400/50 rounded"></div>
                    </div>
                  ))}
                </div>
             </div>
             
             <Link to="/admin/leaderboard" className="relative z-10">
               <button className="w-full py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-sm">
                 View Full Leaderboard
               </button>
             </Link>

             {/* Background Decoration */}
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500 rounded-full opacity-20 blur-2xl"></div>
             <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-purple-500 rounded-full opacity-20 blur-2xl"></div>
          </motion.div>
        </div>

      </motion.div>
    </AdminLayout>
  );
}

// ================= SUB-COMPONENTS =================

function StatCard({ title, value, icon: Icon, color, trend, trendUp, loading }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
    purple: "text-purple-600 bg-purple-50",
  };

  return (
    <motion.div 
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <div className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {trendUp ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-gray-100 rounded animate-pulse mt-1"></div>
        ) : (
          <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
        )}
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl text-xs">
        <p className="font-bold text-indigo-300">{data.fullName}</p>
        <p className="text-gray-400 mb-2">{data.exam}</p>
        <div className="flex justify-between gap-4 border-t border-gray-700 pt-2 mt-1">
          <span>Score</span>
          <span className="font-bold text-white">{data.score}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Date</span>
          <span className="text-gray-400">{data.date}</span>
        </div>
      </div>
    );
  }
  return null;
};

const ChartSkeleton = () => (
  <div className="w-full h-full flex items-end gap-2 p-4 animate-pulse">
    {[...Array(7)].map((_, i) => (
      <div key={i} className="flex-1 bg-gray-100 rounded-t-lg" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <tr>
    <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-100 rounded-full mx-auto animate-pulse"></div></td>
    <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-100 rounded ml-auto animate-pulse"></div></td>
  </tr>
);