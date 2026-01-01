import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import StudentLayout from "../../layouts/StudentLayout";
import { useAuth } from "../../context/AuthContext";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { Trophy, Target, TrendingUp, Calendar, ArrowRight, PlayCircle, Activity } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState([]);

  // Derived Stats
  const testsTaken = results.length;
  
  const avgScore = testsTaken > 0 
    ? Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / testsTaken)
    : 0;

  const highestScore = testsTaken > 0 
    ? Math.max(...results.map(r => r.score)) 
    : 0;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (user?._id) {
          const resultsRes = await api.get(`/exam/results/${user._id}`);
          const data = resultsRes.data;
          setResults(data);

          // Prepare Graph Data (Oldest to Newest)
          const chartData = [...data].reverse().map((r) => {
             const total = r.testId?.totalMarks || 100;
             const percentage = Math.round((r.score / total) * 100);
             return {
               name: r.testId?.title || "Test",
               score: r.score,
               percentage: percentage,
               date: new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
             };
          });
          setGraphData(chartData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Custom Tooltip for Graph
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl text-xs">
          <p className="font-bold text-gray-800 mb-1">{payload[0].payload.name}</p>
          <p className="text-gray-500 mb-1">{payload[0].payload.date}</p>
          <p className="text-indigo-600 font-bold">Score: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* === HERO HEADER === */}
        <div className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-10 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Student Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Welcome back, <span className="text-indigo-600">{user?.name || "Student"}</span>! 👋
            </h1>
            <p className="text-gray-500 mt-3 text-lg max-w-xl">
              Track your progress, analyze your results, and keep improving your skills.
            </p>
          </div>
          
          <Link to="/student/all-tests">
            <button className="group flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all transform hover:-translate-y-1">
              <PlayCircle size={22} className="fill-current" /> 
              <span>Take a New Test</span>
            </button>
          </Link>
        </div>

        {/* === STATS CARDS === */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                <Trophy size={24} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">{testsTaken}</h3>
            <p className="text-sm text-gray-500 font-medium">Tests Completed</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-100 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                <Target size={24} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Average</span>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">{avgScore}%</h3>
            <p className="text-sm text-gray-500 font-medium">Overall Score</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-green-100 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Best</span>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-1">{highestScore}</h3>
            <p className="text-sm text-gray-500 font-medium">Highest Marks</p>
          </div>
        </div>

        {/* === MAIN CONTENT GRID === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* === LEFT: PERFORMANCE GRAPH (2/3) === */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="text-indigo-600" size={24} /> Performance Trend
              </h3>
              <select className="bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-100">
                <option>Last 10 Tests</option>
              </select>
            </div>
            
            <div className="h-[300px] w-full flex-1">
               {graphData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 500}} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 500}} 
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4f46e5', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area 
                        type="monotone" 
                        dataKey="percentage" 
                        stroke="#4f46e5" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorScore)" 
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#4338ca' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                   <p className="font-medium">No performance data yet.</p>
                   <span className="text-xs mt-1 text-gray-400">Complete a test to see your analytics.</span>
                 </div>
               )}
            </div>
          </div>

          {/* === RIGHT: RECENT HISTORY (1/3) === */}
          <div className="flex flex-col h-full">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full min-h-[400px]">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                   <Calendar className="text-indigo-600" size={20} /> Recent Activity
                </h3>
                {results.length > 0 && (
                  <Link to="/student/results" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
                    View All <ArrowRight size={14} />
                  </Link>
                )}
              </div>

              <div className="overflow-y-auto flex-1 p-4 custom-scrollbar">
                {results.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 px-6">
                     <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                       <Calendar size={24} className="opacity-50" />
                     </div>
                     <p className="text-sm font-medium text-gray-500">No exams attempted yet.</p>
                     <Link to="/student/all-tests" className="text-xs font-bold text-indigo-600 mt-2 hover:underline">Start your first test</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {results.slice(0, 5).map((r) => {
                       const isPassed = r.score >= r.testId?.passingMarks;
                       return (
                        <Link to={`/student/result/${r._id}`} key={r._id} className="block group">
                          <div className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all duration-300 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${
                                isPassed ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                              }`}>
                                {r.score}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 truncate max-w-[140px] group-hover:text-indigo-600 transition-colors">
                                  {r.testId?.title || "Deleted Test"}
                                </h4>
                                <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                                  {new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all">
                              <ArrowRight size={18} />
                            </div>
                          </div>
                        </Link>
                       );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </StudentLayout>
  );
}