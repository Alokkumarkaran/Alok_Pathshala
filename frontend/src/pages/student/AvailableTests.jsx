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
  RefreshCw,
  Library,
  AlertTriangle,
  ChevronDown
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
<div className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-indigo-100/50 border border-white/20 overflow-visible mb-8">
  
  {/* Modern Gradient Blobs */}
  <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
  <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-50/50 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
  
  <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8">
    
    {/* Title Section */}
    <div className="space-y-1 max-w-xl">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
           <Library size={20} />
        </div>
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Assessment Hub</span>
      </div>
      <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
        Exam Library
      </h1>
      <p className="text-slate-500 text-lg font-medium mt-3">
        Browse <span className="text-slate-900 font-bold">{tests.length}</span> active assessments available for students.
      </p>
    </div>

    {/* Controls: Search & Filter */}
    <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-3">
      
      {/* Search Input */}
      <div className="relative group flex-1 sm:w-80">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Find an exam..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-12 py-4 bg-slate-50 border-2 border-transparent hover:border-slate-200 focus:border-indigo-500 rounded-2xl text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all shadow-inner"
        />
        {searchTerm ? (
          <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-rose-500 transition-colors">
            <X size={18} />
          </button>
        ) : (
             // Visual "Shortcut" Hint (Non-functional, purely aesthetic for pro feel)
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <kbd className="hidden md:inline-flex items-center h-6 px-2 text-xs font-bold text-slate-400 bg-white border border-slate-200 rounded">⌘K</kbd>
            </div>
        )}
      </div>

      {/* Filter Dropdown */}
      <div className="relative min-w-[160px]">
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className={`w-full h-full px-5 py-4 flex items-center justify-between gap-3 rounded-2xl font-bold transition-all border-2 ${
            filterDifficulty !== "All" 
              ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" 
              : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-2">
              <Filter size={18} />
              <span>{filterDifficulty}</span>
          </div>
          <ChevronDown size={16} className={`transition-transform duration-300 ${showFilter ? 'rotate-180' : ''}`} />
        </button>

        {showFilter && (
          <div className="absolute right-0 mt-2 w-full min-w-[180px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-2 z-50">
            {["All", "Easy", "Medium", "Hard"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => { setFilterDifficulty(lvl); setShowFilter(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  filterDifficulty === lvl ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
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

{/* === ERROR STATE (Refined) === */}
{error && (
  <div className="bg-red-50/50 border border-red-100 rounded-[2rem] p-8 text-center animate-in fade-in slide-in-from-bottom-4 mb-8">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm mb-4">
        <AlertTriangle size={32} className="text-red-500" />
    </div>
    <h3 className="text-xl font-black text-slate-900 mb-2">Connection Interrupted</h3>
    <p className="text-slate-500 font-medium mb-6 max-w-md mx-auto">{error}. Please check your connection and try again.</p>
    <button 
      onClick={fetchTests}
      className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 hover:-translate-y-1 active:scale-95 inline-flex items-center gap-2"
    >
      <RefreshCw size={18} className="animate-spin-slow" /> Retry Connection
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