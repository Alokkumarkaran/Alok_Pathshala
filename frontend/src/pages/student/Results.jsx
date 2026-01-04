import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import StudentLayout from "../../layouts/StudentLayout";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Trophy,
  TrendingUp,
  ArrowRight,
  BarChart2,
  Search,
  Filter,
  Clock,
  Target,
  AlertCircle // Added for deleted tests
} from "lucide-react";

export default function Results() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, passed, failed
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user?._id) {
      api.get(`/exam/results/${user._id}`)
        .then((res) => {
          setResults(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch results", err);
          setLoading(false);
        });
    }
  }, [user]);

  // --- DERIVED STATS & FILTERING ---
  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      // SAFEGUARD 1: Handle null testId (Deleted Tests)
      const test = r.testId || { title: "", passingMarks: 0 };
      
      const testTitle = test.title.toLowerCase();
      const matchesSearch = testTitle.includes(search.toLowerCase());
      
      const isPassed = r.score >= test.passingMarks;
      
      if (filter === "passed") return matchesSearch && isPassed;
      if (filter === "failed") return matchesSearch && !isPassed;
      return matchesSearch;
    });
  }, [results, filter, search]);

  const stats = useMemo(() => {
    if (!results.length) return null;
    const totalTests = results.length;
    
    // SAFEGUARD 2: Calculate stats safely even if test is deleted
    const passedTests = results.filter(r => {
        const passingMarks = r.testId?.passingMarks || 0;
        return r.score >= passingMarks;
    }).length;
    
    // Calculate Average Percentage
    const totalPercentage = results.reduce((acc, curr) => {
      const max = curr.testId?.totalMarks || 100; // Default to 100 to avoid division by zero
      return acc + ((curr.score / max) * 100);
    }, 0);
    
    return {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      avgScore: Math.round(totalPercentage / totalTests) || 0,
      passRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
    };
  }, [results]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric"
    });
  };

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gray-50/50 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
          
          {/* ================= HEADER & STATS DASHBOARD ================= */}
<div className="bg-white border border-gray-200 rounded-3xl p-6 lg:p-8 mb-10 shadow-sm">
  
  {/* Header Section */}
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
    <div>
      <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
        Performance Overview
        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100 uppercase tracking-wide">
            Live Stats
        </span>
      </h1>
      <p className="text-gray-500 mt-2 font-medium text-lg">
        Track your progress and analyze your assessment history.
      </p>
    </div>
    
    {/* Optional: Date/Context */}
    <div className="text-right hidden md:block">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last Updated</p>
        <p className="text-sm font-bold text-gray-900">Just now</p>
    </div>
  </div>

  {!loading && results.length > 0 && stats && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Card 1: Total Attempts (Blue) */}
      <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl flex items-center gap-4 transition-transform hover:-translate-y-1">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
          <Trophy size={24} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Attempts</p>
          <h3 className="text-3xl font-black text-gray-900">{stats.total}</h3>
        </div>
      </div>
      
      {/* Card 2: Passed (Green) */}
      <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl flex items-center gap-4 transition-transform hover:-translate-y-1">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm">
          <CheckCircle size={24} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Passed Exams</p>
          <h3 className="text-3xl font-black text-gray-900">{stats.passed}</h3>
        </div>
      </div>

      {/* Card 3: Avg Score (Purple) */}
      <div className="bg-purple-50/50 border border-purple-100 p-5 rounded-2xl flex items-center gap-4 transition-transform hover:-translate-y-1">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl shadow-sm">
          <Target size={24} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Avg. Score</p>
          <h3 className="text-3xl font-black text-gray-900">{stats.avgScore}%</h3>
        </div>
      </div>

       {/* Card 4: Efficiency/Time (Orange) - New Addition to fill grid */}
       <div className="bg-orange-50/50 border border-orange-100 p-5 rounded-2xl flex items-center gap-4 transition-transform hover:-translate-y-1">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl shadow-sm">
          <TrendingUp size={24} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Success Rate</p>
          <h3 className="text-3xl font-black text-gray-900">
            {stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}%
          </h3>
        </div>
      </div>

                {/* Stat Card 4 */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Pass Rate</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stats.passRate}%</h3>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= CONTROLS (SEARCH & FILTER) ================= */}
          {!loading && results.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search exam by title..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter size={18} className="text-gray-500" />
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full md:w-48 p-2.5"
                >
                  <option value="all">All Results</option>
                  <option value="passed">Passed Only</option>
                  <option value="failed">Failed Only</option>
                </select>
              </div>
            </div>
          )}

          {/* ================= LOADING STATE ================= */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-100 animate-spin border-t-indigo-600 mb-4"></div>
              <p className="text-gray-500 font-medium animate-pulse">Analyzing performance...</p>
            </div>
          )}

          {/* ================= EMPTY STATE ================= */}
          {!loading && results.length === 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-16 text-center max-w-2xl mx-auto mt-10">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                <BarChart2 size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Exam History Found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                You haven't taken any assessments yet. Jump into the dashboard to start your learning journey today!
              </p>
              <Link to="/student">
                <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 hover:-translate-y-1">
                  Start Your First Exam
                </button>
              </Link>
            </div>
          )}

          {/* ================= RESULTS GRID ================= */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredResults.map((r) => {
                // SAFEGUARD 3: Handle Missing Test Data (Admin Deleted It)
                // If r.testId is null, use a fallback object
                const test = r.testId || { 
                    title: "Assessment Unavailable (Deleted)", 
                    passingMarks: 0, 
                    totalMarks: 100, // Prevent division by zero
                    isDeleted: true 
                };
                
                const passed = r.score >= test.passingMarks;
                // Calculate percentage safely
                const percentage = test.totalMarks > 0 ? Math.round((r.score / test.totalMarks) * 100) : 0;

                return (
                  <div
                    key={r._id}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col"
                  >
                    {/* Card Header with Status Color */}
                    <div className={`h-2 w-full ${passed ? "bg-gradient-to-r from-emerald-400 to-emerald-600" : "bg-gradient-to-r from-red-400 to-red-600"}`}></div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 pr-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            <Clock size={12} />
                            {formatDate(r.createdAt)}
                          </div>
                          
                          {/* Title Handling for Deleted Tests */}
                          <h3 className={`text-lg font-bold line-clamp-2 transition-colors ${test.isDeleted ? 'text-gray-400 italic' : 'text-gray-900 group-hover:text-indigo-600'}`}>
                            {test.isDeleted && <AlertCircle size={16} className="inline mr-1 text-orange-400" />}
                            {test.title}
                          </h3>
                        </div>
                        
                        {passed ? (
                          <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 p-1.5 rounded-lg flex-shrink-0">
                            <CheckCircle size={20} />
                          </div>
                        ) : (
                          <div className="bg-red-50 text-red-700 border border-red-100 p-1.5 rounded-lg flex-shrink-0">
                            <XCircle size={20} />
                          </div>
                        )}
                      </div>

                      {/* Score Circle & Stats */}
                      <div className="flex items-center gap-6 mb-6">
                        <div className="relative w-16 h-16 flex-shrink-0">
                           {/* SVG Circle for visual flair */}
                           <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" 
                              strokeDasharray={175.92} 
                              strokeDashoffset={175.92 - (175.92 * percentage) / 100} 
                              className={passed ? "text-emerald-500" : "text-red-500"} 
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 w-full">
                          <div>
                            <span className="text-xs text-gray-400 block">Score</span>
                            <span className="font-bold text-gray-800">{r.score} <span className="text-gray-400 font-normal">/ {test.totalMarks}</span></span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 block">Status</span>
                            <span className={`font-bold ${passed ? "text-emerald-600" : "text-red-600"}`}>
                              {passed ? "Pass" : "Fail"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Mini-Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-6">
                        <div className="bg-emerald-50/50 rounded-lg p-2 text-center border border-emerald-100">
                           <span className="block text-xs text-emerald-600/70 font-medium">Correct</span>
                           <span className="block font-bold text-emerald-700">{r.correctAnswers}</span>
                        </div>
                        <div className="bg-red-50/50 rounded-lg p-2 text-center border border-red-100">
                           <span className="block text-xs text-red-600/70 font-medium">Incorrect</span>
                           <span className="block font-bold text-red-700">{r.wrongAnswers}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-auto">
                        <Link to={`/student/result/${r._id}`}>
                          <button className="w-full py-2.5 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                            Detailed Report
                            <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* No Search Results State */}
          {!loading && results.length > 0 && filteredResults.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No results found</h3>
              <p className="text-gray-500">Try adjusting your filters or search query.</p>
              <button 
                onClick={() => {setSearch(""); setFilter("all")}}
                className="mt-4 text-indigo-600 font-semibold hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
          
        </div>
      </div>
    </StudentLayout>
  );
}