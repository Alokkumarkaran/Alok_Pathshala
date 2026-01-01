import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import StudentLayout from "../../layouts/StudentLayout";
import { 
  FileText, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  TrendingUp,
  ArrowRight,
  BarChart2
} from "lucide-react";

export default function Results() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Helper for date formatting
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto px-4 py-4">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Performance</h1>
            <p className="text-gray-500 mt-1">View your exam history and detailed analytics.</p>
          </div>
          
          {/* Summary Badge */}
          <div className="bg-white shadow-sm px-5 py-2.5 rounded-full border border-gray-200 flex items-center gap-3 text-sm font-semibold text-indigo-700">
            <Trophy size={18} className="text-yellow-500" />
            <span>{results.length} Attempts</span>
          </div>
        </div>

        {/* ================= LOADING STATE ================= */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-80">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-100 animate-spin border-t-indigo-600 mb-4"></div>
            <p className="text-gray-500 font-medium animate-pulse">Loading scorecard...</p>
          </div>
        )}

        {/* ================= EMPTY STATE ================= */}
        {!loading && results.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center max-w-lg mx-auto mt-10">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Exams Yet</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              You haven't taken any assessments yet. Go to your dashboard to start learning!
            </p>
            <Link to="/student">
              <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 hover:-translate-y-1">
                Go to Dashboard
              </button>
            </Link>
          </div>
        )}

        {/* ================= RESULTS GRID ================= */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {results.map((r) => {
              // Safety Checks
              const test = r.testId || { title: "Deleted Test", passingMarks: 0, totalMarks: 100 };
              const passed = r.score >= test.passingMarks;
              // Calculate Percentage (Avoid division by zero)
              const percentage = test.totalMarks > 0 ? Math.round((r.score / test.totalMarks) * 100) : 0;

              return (
                <div
                  key={r._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                  {/* Status Bar */}
                  <div className={`h-1.5 w-full ${passed ? "bg-green-500" : "bg-red-500"}`}></div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    
                    {/* Top Section: Title & Date */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="pr-4">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {test.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 text-xs font-medium text-gray-400">
                          <Calendar size={14} />
                          {formatDate(r.createdAt)}
                        </div>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        passed 
                          ? "bg-green-50 text-green-700 border-green-100" 
                          : "bg-red-50 text-red-700 border-red-100"
                      }`}>
                        {passed ? "Passed" : "Failed"}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      
                      {/* Score Box */}
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col items-center justify-center text-center">
                        <TrendingUp size={16} className="text-gray-400 mb-1" />
                        <span className="text-lg font-black text-gray-800">
                          {r.score}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">
                          / {test.totalMarks}
                        </span>
                      </div>

                      {/* Correct Box */}
                      <div className="bg-green-50/50 rounded-xl p-3 border border-green-100 flex flex-col items-center justify-center text-center">
                        <CheckCircle size={16} className="text-green-500 mb-1" />
                        <span className="text-lg font-black text-green-700">
                          {r.correctAnswers}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-green-600/70 tracking-wide">
                          Correct
                        </span>
                      </div>

                      {/* Wrong Box */}
                      <div className="bg-red-50/50 rounded-xl p-3 border border-red-100 flex flex-col items-center justify-center text-center">
                        <XCircle size={16} className="text-red-500 mb-1" />
                        <span className="text-lg font-black text-red-700">
                          {r.wrongAnswers}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-red-600/70 tracking-wide">
                          Wrong
                        </span>
                      </div>
                    </div>

                    {/* Footer Section */}
                    <div className="mt-auto">
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mb-1.5">
                          <span>Performance Score</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${passed ? "bg-green-500" : "bg-red-500"}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* View Analysis Button */}
                      <Link to={`/student/result/${r._id}`}>
                        <button className="w-full py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white font-bold rounded-lg text-sm transition-all border border-indigo-100 flex items-center justify-center gap-2 group/btn">
                          <BarChart2 size={16} />
                          Detailed Analysis
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
      </div>
    </StudentLayout>
  );
}