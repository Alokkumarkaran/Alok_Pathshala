import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import { 
  Users, 
  FileText, 
  Activity, 
  Plus, 
  Trophy, 
  ArrowRight, 
  TrendingUp,
  Calendar
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    activeTests: 0,
    totalAttempts: 0,
    uniqueStudents: 0
  });

  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [testsRes, resultsRes] = await Promise.all([
          api.get("/test/admin/all"),
          api.get("/exam/admin/results")
        ]);

        const tests = Array.isArray(testsRes.data) ? testsRes.data : testsRes.data.tests || [];
        const results = resultsRes.data;

        const uniqueStudentIds = new Set(
          results.map(r => r.studentId?._id)
        );

        setStats({
          activeTests: tests.length,
          totalAttempts: results.length,
          uniqueStudents: uniqueStudentIds.size
        });

        // Slice for table
        setRecentResults(results.slice(0, 5));

        // Prepare Chart Data (Last 7 attempts reversed for chronological order)
        const graphData = [...results].slice(0, 10).reverse().map((r, i) => ({
          name: `Attempt ${i + 1}`,
          score: r.score,
          total: r.testId?.totalMarks || 100,
          student: r.studentId?.name || "Student"
        }));
        setChartData(graphData);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Custom Tooltip for Chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl text-xs">
          <p className="font-bold text-gray-800">{payload[0].payload.student}</p>
          <p className="text-indigo-600 font-bold">Score: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* ================= HEADER SECTION ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
            <p className="text-gray-500 mt-2 flex items-center gap-2">
              <Calendar size={16} /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="flex gap-3">
             <Link to="/admin/create-test">
               <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 font-semibold text-sm transform hover:-translate-y-0.5">
                 <Plus size={18} /> Create Assessment
               </button>
             </Link>
          </div>
        </div>

        {/* ================= STATS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Active Tests */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-indigo-100 transition-all">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Exams</p>
              <h3 className="text-3xl font-black text-gray-900">{loading ? "-" : stats.activeTests}</h3>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
          </div>

          {/* Card 2: Students */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-purple-100 transition-all">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Students</p>
              <h3 className="text-3xl font-black text-gray-900">{loading ? "-" : stats.uniqueStudents}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
          </div>

          {/* Card 3: Attempts */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-green-100 transition-all">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Attempts</p>
              <h3 className="text-3xl font-black text-gray-900">{loading ? "-" : stats.totalAttempts}</h3>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ================= LEFT: RECENT RESULTS TABLE (2/3 Width) ================= */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Activity size={18} className="text-indigo-500" /> Recent Activity
              </h3>
              <Link to="/admin/results" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-3 bg-gray-50/50">Student</th>
                    <th className="px-6 py-3 bg-gray-50/50">Exam</th>
                    <th className="px-6 py-3 bg-gray-50/50 text-center">Score</th>
                    <th className="px-6 py-3 bg-gray-50/50 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan="4" className="p-8 text-center text-gray-400">Loading data...</td></tr>
                  ) : recentResults.length === 0 ? (
                    <tr><td colSpan="4" className="p-8 text-center text-gray-400">No recent activity.</td></tr>
                  ) : (
                    recentResults.map((r) => {
                      const isPassed = r.score >= (r.testId?.passingMarks || 0);
                      return (
                        <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold uppercase">
                                {r.studentId?.name?.charAt(0) || "U"}
                              </div>
                              <span className="text-sm font-semibold text-gray-700">{r.studentId?.name || "Unknown"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {r.testId?.title || "Deleted Test"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isPassed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                            }`}>
                              {r.score}
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
          </div>

          {/* ================= RIGHT: CHART & QUICK LINKS (1/3 Width) ================= */}
          <div className="space-y-8">
            
            {/* PERFORMANCE CHART */}
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-green-500" /> Score Trend
              </h3>
              <div className="h-[200px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="score" stroke="#4f46e5" fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data to display</div>
                )}
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
               <h3 className="font-bold text-lg mb-2">Leaderboard</h3>
               <p className="text-indigo-200 text-sm mb-6">Check who is topping the charts this week.</p>
               <Link to="/admin/leaderboard">
                 <button className="w-full py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition flex items-center justify-center gap-2">
                   <Trophy size={18} className="text-yellow-500" /> View Rankings
                 </button>
               </Link>
            </div>

          </div>

        </div>
      </div>
    </AdminLayout>
  );
}