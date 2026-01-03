import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import StudentLayout from "../../layouts/StudentLayout";
import { 
  Search, 
  Filter, 
  Clock, 
  Award, 
  ChevronRight, 
  BookOpen, 
  BarChart, 
  X,
  Zap,
  AlertCircle,
  RefreshCw
} from "lucide-react";

export default function AvailableTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added Error State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("All"); // Added Filter State
  const [showFilter, setShowFilter] = useState(false);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/test/student/all");
      setTests(res.data);
    } catch (error) {
      console.error("Failed to load tests", error);
      setError("Failed to load exams. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  // Helper: Difficulty Badge Styling & Logic
  const getDifficultyLabel = (passingMarks, totalMarks) => {
    const ratio = passingMarks / totalMarks;
    if (ratio >= 0.5) return "Hard";
    if (ratio >= 0.35) return "Medium";
    return "Easy";
  };

  const getDifficultyStyle = (label) => {
    switch (label) {
      case "Hard": return { color: "text-rose-600 bg-rose-50 border-rose-100 ring-rose-500/10", iconColor: "text-rose-500" };
      case "Medium": return { color: "text-amber-600 bg-amber-50 border-amber-100 ring-amber-500/10", iconColor: "text-amber-500" };
      default: return { color: "text-emerald-600 bg-emerald-50 border-emerald-100 ring-emerald-500/10", iconColor: "text-emerald-500" };
    }
  };

  // Filter tests based on search AND difficulty
  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase());
    const difficultyLabel = getDifficultyLabel(test.passingMarks, test.totalMarks);
    const matchesFilter = filterDifficulty === "All" || difficultyLabel === filterDifficulty;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-0 sm:px-6 py-2 space-y-4">
        
        {/* === HEADER SECTION === */}
        <div className="relative bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 overflow-visible">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-50 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none opacity-60"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Exam Library
              </h1>
              <p className="text-slate-500 text-lg">
                Discover {tests.length} assessments designed to challenge your skills.
              </p>
            </div>

            {/* Actions: Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              
              {/* Search Bar */}
              <div className="relative group w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={20} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowFilter(!showFilter)}
                  className={`h-full px-5 py-3.5 flex items-center gap-2 rounded-2xl border font-semibold transition-all ${
                    filterDifficulty !== "All" 
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Filter size={20} />
                  <span className="hidden sm:inline">{filterDifficulty === "All" ? "Filter" : filterDifficulty}</span>
                </button>

                {/* Dropdown Menu */}
                {showFilter && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    {["All", "Easy", "Medium", "Hard"].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => {
                          setFilterDifficulty(lvl);
                          setShowFilter(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          filterDifficulty === lvl 
                            ? "bg-indigo-50 text-indigo-700" 
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* === ERROR STATE === */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 text-center animate-in fade-in">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-rose-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-rose-600 mb-6">{error}</p>
            <button 
              onClick={fetchTests}
              className="px-6 py-2.5 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw size={18} /> Retry
            </button>
          </div>
        )}

        {/* === CONTENT GRID === */}
        {!error && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-[320px] bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4 animate-pulse">
                     <div className="flex justify-between">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                        <div className="w-16 h-6 bg-slate-100 rounded-full"></div>
                     </div>
                     <div className="h-6 bg-slate-100 rounded w-3/4 mt-2"></div>
                     <div className="h-24 bg-slate-100 rounded-2xl w-full mt-auto"></div>
                     <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
                  </div>
                ))}
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Search size={32} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">No matches found</h3>
                <p className="text-slate-400">
                  {filterDifficulty !== "All" 
                    ? `No ${filterDifficulty} exams match "${searchTerm}"` 
                    : "Try searching for a different keyword."}
                </p>
                <button 
                  onClick={() => {setSearchTerm(""); setFilterDifficulty("All");}}
                  className="mt-4 text-indigo-600 font-semibold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {filteredTests.map((test) => {
                  const label = getDifficultyLabel(test.passingMarks, test.totalMarks);
                  const style = getDifficultyStyle(label);
                  
                  return (
                    <div
                      key={test._id}
                      className="group relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden"
                    >
                      <div className="p-6 flex flex-col flex-1">
                        
                        {/* Top Row: Icon & Badge */}
                        <div className="flex justify-between items-start mb-5">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                            <BookOpen size={24} strokeWidth={2.5} />
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ring-1 ${style.color}`}>
                            {label}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                          {test.title}
                        </h3>

                        {/* Metadata Pill Box */}
                        <div className="mt-auto pt-6">
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-2 gap-y-3">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
                                <Clock size={14} className="text-indigo-400" />
                                <span>{test.duration} min</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide justify-end">
                                <Award size={14} className="text-indigo-400" />
                                <span>{test.totalMarks} Marks</span>
                              </div>
                              <div className="col-span-2 border-t border-slate-200/50 pt-3 flex items-center gap-2">
                                  <BarChart size={14} className={style.iconColor} />
                                  <span className="text-xs font-medium text-slate-500">
                                    Passing Score: <span className="text-slate-800 font-bold">{test.passingMarks}</span>
                                  </span>
                              </div>
                          </div>
                        </div>

                        {/* Button */}
                        <Link to={`/student/exam/${test._id}`} className="mt-5 block">
                          <button className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-200 transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                            <Zap size={18} className="fill-current" />
                            Start Exam
                            <ChevronRight size={18} className="opacity-0 -ml-2 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-300" />
                          </button>
                        </Link>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </StudentLayout>
  );
}