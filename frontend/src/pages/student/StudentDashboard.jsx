import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import StudentLayout from "../../layouts/StudentLayout";
import { useAuth } from "../../context/AuthContext";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { 
  Trophy, Target, TrendingUp, Calendar, ArrowRight, PlayCircle, 
  Activity, BarChart3, Sun, Moon, CloudSun, CloudMoon, Clock, CheckCircle2, XCircle, AlertCircle
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState([]);

  // === LOGIC: Derived Stats ===
  const testsTaken = results.length;
  
  const avgScore = testsTaken > 0 
    ? Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / testsTaken)
    : 0;

  const highestScore = testsTaken > 0 
    ? Math.max(...results.map(r => r.score)) 
    : 0;

  // === LOGIC: IMPROVED Time Based Greeting ===
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    
    // 5 AM to 11:59 AM -> Morning
    if (hour >= 5 && hour < 12) {
        return { text: "Good Morning", icon: Sun, color: "text-yellow-400" };
    } 
    // 12 PM to 4:59 PM -> Afternoon
    if (hour >= 12 && hour < 17) {
        return { text: "Good Afternoon", icon: CloudSun, color: "text-orange-400" };
    } 
    // 5 PM to 8:59 PM -> Evening
    if (hour >= 17 && hour < 21) {
        return { text: "Good Evening", icon: CloudMoon, color: "text-indigo-300" };
    } 
    // 9 PM to 4:59 AM -> Night
    return { text: "Good Night", icon: Moon, color: "text-violet-200" };
  };

  const greeting = getTimeBasedGreeting();

  // === LOGIC: Data Fetching ===
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (user?._id) {
          const resultsRes = await api.get(`/exam/results/${user._id}`);
          const data = resultsRes.data;
          setResults(data);

          const chartData = [...data].reverse().map((r) => {
              // SAFEGUARD: Handle deleted test data for Chart
              const test = r.testId || { title: "Deleted Test", totalMarks: 100 };
              const total = test.totalMarks || 100; // Prevent division by zero
              const percentage = Math.round((r.score / total) * 100);
              
              return {
                name: test.title,
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

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md p-3 border border-indigo-100 shadow-xl rounded-xl text-xs z-50">
          <p className="font-bold text-slate-800 mb-1">{payload[0].payload.name}</p>
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Calendar size={12} />
            {payload[0].payload.date}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <p className="text-indigo-700 font-bold">Score: {payload[0].value}%</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-0 sm:px-6 py-2 sm:py-8 space-y-4 sm:space-y-8">
        
        {/* === HERO HEADER === */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-700 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl shadow-indigo-500/30 text-white p-6 sm:p-12 border border-white/10 isolate">
            
            {/* 1. Background Texture & Lighting Effects */}
            <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px]"></div>
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-50">
                <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"></div>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                
                {/* Left Side: Content */}
                <div className="space-y-4 w-full max-w-2xl">
                    {/* Dynamic Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-sm transition-transform hover:scale-105 cursor-default">
                        <greeting.icon size={16} className={`${greeting.color} drop-shadow-md`} />
                        <span className="text-xs sm:text-sm font-bold tracking-wide uppercase text-white/90">{greeting.text}</span>
                    </div>
                    
                    {/* Main Heading */}
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none drop-shadow-lg">
                        <span className="block text-indigo-200 text-xl sm:text-2xl font-semibold mb-2 tracking-normal">Welcome back,</span>
                        {user?.name || "Student"}
                    </h1>
                    
                    <p className="text-indigo-100/90 text-base sm:text-lg font-medium leading-relaxed max-w-lg">
                        Analyze your past performance or challenge yourself with a new exam.
                    </p>
                </div>
                
                {/* Right Side: CTA Button */}
                <div className="w-full md:w-auto flex-shrink-0">
                      <Link to="/student/all-tests" className="block w-full">
                        <button className="group relative w-full md:w-auto flex items-center justify-center gap-3 px-8 py-5 bg-white text-indigo-700 rounded-2xl font-bold text-lg shadow-[0_20px_50px_-12px_rgba(255,255,255,0.3)] hover:shadow-[0_20px_50px_-12px_rgba(255,255,255,0.5)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                            
                            {/* Button Shine Effect */}
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-indigo-100/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                            
                            <div className="relative flex items-center gap-3">
                                <PlayCircle size={24} className="fill-indigo-600 text-indigo-50" /> 
                                <span>Start New Test</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    </Link>
                    <p className="text-center md:text-right text-indigo-200/60 text-xs font-medium mt-3">
                        Ready to improve your score?
                    </p>
                </div>
            </div>
        </div>

        {/* === STATS CARDS === */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Card 1: Completed Tests */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-white p-6 rounded-3xl border border-blue-100 shadow-sm hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-100/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-200/50 transition-colors"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                    <Trophy size={16} strokeWidth={3} />
                  </span>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Completed</p>
                </div>
                <h3 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">
                  {testsTaken}
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Total Exams</p>
              </div>
              
              {/* Decorative Icon on Right */}
              <div className="text-blue-200 group-hover:text-blue-300 group-hover:scale-110 transition-all duration-500 transform rotate-12">
                <Trophy size={48} />
              </div>
            </div>
          </div>

          {/* Card 2: Average Score */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-violet-50 to-white p-6 rounded-3xl border border-violet-100 shadow-sm hover:shadow-lg hover:border-violet-300 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute right-0 top-0 w-32 h-32 bg-violet-100/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-violet-200/50 transition-colors"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1.5 bg-violet-100 text-violet-600 rounded-lg">
                    <Target size={16} strokeWidth={3} />
                  </span>
                  <p className="text-xs font-bold text-violet-600 uppercase tracking-wider">Average</p>
                </div>
                <h3 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">
                  {avgScore}<span className="text-2xl sm:text-3xl text-slate-400">%</span>
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Overall Performance</p>
              </div>
              
              <div className="text-violet-200 group-hover:text-violet-300 group-hover:scale-110 transition-all duration-500 transform rotate-12">
                <Target size={48} />
              </div>
            </div>
          </div>

          {/* Card 3: Best Score */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white p-6 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-100/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-200/50 transition-colors"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                    <TrendingUp size={16} strokeWidth={3} />
                  </span>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Best Score</p>
                </div>
                <h3 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">
                  {highestScore}
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Personal Record</p>
              </div>
              
              <div className="text-emerald-200 group-hover:text-emerald-300 group-hover:scale-110 transition-all duration-500 transform rotate-12">
                <TrendingUp size={48} />
              </div>
            </div>
          </div>

        </div>

        {/* === MAIN CONTENT GRID === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* === LEFT: PERFORMANCE GRAPH (2/3) === */}
          <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
            
            {/* Header has padding */}
            <div className="p-5 sm:p-8 flex flex-row justify-between items-center pb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                 <Activity className="text-indigo-600" size={20} />
                 <h3 className="text-lg sm:text-xl font-bold text-slate-800">Performance</h3>
              </div>
              <div className="bg-slate-50 px-3 py-1 rounded-lg text-xs font-medium text-slate-500 border border-slate-100">
                Last 10 Tests
              </div>
            </div>
            
            {/* Chart Area */}
            <div className="h-[280px] sm:h-[350px] w-full">
               {graphData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={graphData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} 
                        dy={10}
                        interval="preserveStartEnd"
                        padding={{ left: 20, right: 20 }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} 
                        width={30} 
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }} />
                      <Area 
                        type="monotone" 
                        dataKey="percentage" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorScore)" 
                        activeDot={{ r: 6, strokeWidth: 3, stroke: '#fff', fill: '#6366f1' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center p-4">
                   <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                      <BarChart3 className="text-slate-300" size={24} />
                   </div>
                   <p className="font-semibold text-slate-600 text-sm">No performance data yet</p>
                 </div>
               )}
            </div>
          </div>

          {/* === RIGHT: RECENT HISTORY (1/3) === */}
          <div className="flex flex-col h-full">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-full min-h-[400px]">
              
              {/* Header */}
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white z-10 relative">
                <div>
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                     <Clock className="text-indigo-600" size={20} /> Recent Activity
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Your latest exam attempts</p>
                </div>
                
                {results.length > 0 && (
                  <Link to="/student/results" className="group flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition-all">
                    View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>

              {/* Scrollable List */}
              <div className="overflow-y-auto flex-1 p-4 custom-scrollbar bg-slate-50/50 space-y-3">
                {results.length === 0 ? (
                  // Empty State
                  <div className="h-full flex flex-col items-center justify-center text-center px-6">
                      <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                        <AlertCircle size={32} className="text-slate-300" />
                      </div>
                      <h4 className="text-slate-900 font-bold mb-1">No Activity Yet</h4>
                      <p className="text-slate-500 text-sm mb-4">You haven't taken any tests yet.</p>
                      <Link to="/student/all-tests" className="text-sm font-bold text-white bg-indigo-600 px-6 py-2 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                        Start Your First Test
                      </Link>
                  </div>
                ) : (
                  // List Items
                  results.slice(0, 5).map((r) => {
                    // SAFEGUARD: Handle deleted test data for List
                    const test = r.testId || { 
                        title: "Assessment Unavailable", 
                        passingMarks: 0, 
                        isDeleted: true 
                    };
                    const isPassed = r.score >= test.passingMarks;
                    
                    return (
                      <Link to={`/student/result/${r._id}`} key={r._id} className="block group relative">
                        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-4">
                          
                          {/* Left: Icon & Info */}
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            {/* Status Icon Box */}
                            <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border ${
                              test.isDeleted 
                                ? "bg-gray-50 border-gray-100 text-gray-400"
                                : isPassed 
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                                    : "bg-red-50 border-red-100 text-red-500"
                            }`}>
                              {test.isDeleted ? <AlertCircle size={20} /> : (isPassed ? <CheckCircle2 size={20} /> : <XCircle size={20} />)}
                            </div>

                            {/* Text Details */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                 {!test.isDeleted && (
                                     <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                       isPassed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                     }`}>
                                       {isPassed ? "Passed" : "Failed"}
                                     </span>
                                 )}
                                 <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                   <Calendar size={10} />
                                   {new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                 </span>
                              </div>
                              <h4 className={`text-sm sm:text-base font-bold truncate group-hover:text-indigo-600 transition-colors ${test.isDeleted ? 'text-gray-400 italic' : 'text-slate-800'}`}>
                                {test.title}
                              </h4>
                            </div>
                          </div>

                          {/* Right: Score */}
                          <div className="text-right pl-2 border-l border-slate-100">
                              <span className="block text-xs font-semibold text-slate-400 uppercase">Score</span>
                              <span className={`text-xl font-black ${
                                test.isDeleted 
                                    ? "text-gray-400" 
                                    : isPassed ? "text-emerald-600" : "text-red-600"
                              }`}>
                                  {r.score}
                              </span>
                          </div>
                          
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </StudentLayout>
  );
}