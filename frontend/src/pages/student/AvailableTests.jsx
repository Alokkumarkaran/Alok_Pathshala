import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import StudentLayout from "../../layouts/StudentLayout";
import {
  Search,
  Clock,
  Award,
  ChevronRight,
  Folder,
  Layers,
  CheckCircle2,
  RotateCcw,
  Zap,
  ArrowLeft,
  SearchX,
  Sparkles,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

export default function AvailableTests() {
  const [folders, setFolders] = useState([]);
  const [attemptsMap, setAttemptsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Navigation & Filtering
  const [selectedFolder, setSelectedFolder] = useState(null); // Null = Folders view, Object = Folder Sets view
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [foldersRes, attemptsRes] = await Promise.all([
        api.get("/folders/all"),
        api.get("/exam/student/attempts-map").catch(() => ({ data: {} })),
      ]);

      setFolders(foldersRes.data || []);
      setAttemptsMap(attemptsRes.data || {});
    } catch (err) {
      console.error("Failed to load available exams", err);
      setError("Failed to load exams. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectFolder = (folder) => {
    setSelectedFolder(folder);
    setSearchTerm("");
  };

  const currentSets = selectedFolder?.sets || [];

  const filteredFolders = folders.filter((f) =>
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSets = currentSets.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.setName && s.setName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-4 space-y-6">
        
        {/* LIGHT MODE HEADER SECTION */}
        <div className="relative bg-gradient-to-br from-indigo-50 via-white to-white border border-indigo-100 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                <Sparkles size={26} strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wide">
                    Assessment Library
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                  {selectedFolder ? selectedFolder.title : "Exam Folders & Categories"}
                </h1>
                <p className="text-gray-500 mt-1 font-medium text-sm max-w-xl">
                  {selectedFolder
                    ? selectedFolder.description || "Choose an exam set below to attempt or practice."
                    : "Select an examination category folder to view available test sets."}
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={selectedFolder ? "Search exam sets..." : "Search categories..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* BREADCRUMB / BACK BUTTON */}
        {selectedFolder && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedFolder(null)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-600" /> Back to Exam Categories
            </button>
            <span className="text-xs font-bold text-slate-400">
              Showing {filteredSets.length} Exam Sets
            </span>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Connection Error</h3>
            <p className="text-sm text-slate-500">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {/* VIEW 1: EXAM FOLDERS LIST */}
        {!error && !selectedFolder && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-60 bg-white border border-slate-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredFolders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
                <SearchX className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">No Exam Folders Found</h3>
                <p className="text-xs text-slate-400">Try searching with another keyword.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFolders.map((folder) => {
                  const setsList = folder.sets || [];
                  const attemptedSetsCount = setsList.filter((s) => attemptsMap[s._id]?.attempted).length;

                  return (
                    <div
                      key={folder._id}
                      onClick={() => handleSelectFolder(folder)}
                      className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col justify-between space-y-6 relative"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Folder className="w-6 h-6" />
                          </div>
                          {attemptedSetsCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {attemptedSetsCount}/{setsList.length} Attempted
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {folder.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {folder.description || "Contains active exam sets and mock tests."}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                        <span className="inline-flex items-center gap-1.5 text-indigo-600">
                          <Layers className="w-4 h-4" /> {setsList.length} Exam Sets
                        </span>
                        <span className="inline-flex items-center gap-1 text-slate-400 group-hover:text-slate-900 transition">
                          Explore Sets <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* VIEW 2: EXAM SETS INSIDE SELECTED FOLDER */}
        {!error && selectedFolder && (
          <>
            {filteredSets.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
                <Layers className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">No Exam Sets in this Folder</h3>
                <p className="text-xs text-slate-400">Check back soon for new practice sets!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSets.map((test, idx) => {
                  const attemptInfo = attemptsMap[test._id];
                  const isAttempted = !!attemptInfo?.attempted;

                  return (
                    <div
                      key={test._id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between space-y-6 relative"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black uppercase rounded-lg border border-indigo-100">
                            {test.setName || `Set ${idx + 1}`}
                          </span>

                          {isAttempted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-extrabold rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Attempted (Score: {attemptInfo.bestScore}/{test.totalMarks})
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full">
                              New Set
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-slate-900 leading-snug">
                            {test.title}
                          </h3>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Clock className="w-4 h-4 text-indigo-500" />
                            <span>{test.duration} Minutes</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium justify-end">
                            <Award className="w-4 h-4 text-amber-500" />
                            <span>{test.totalMarks} Marks</span>
                          </div>
                          <div className="col-span-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex justify-between items-center">
                            <span>Passing Score: <strong className="text-slate-800">{test.passingMarks}</strong></span>
                            {isAttempted && <span>Attempts: <strong className="text-indigo-600">{attemptInfo.attemptsCount}</strong></span>}
                          </div>
                        </div>
                      </div>

                      <Link to={`/student/exam/${test._id}`} className="block">
                        {isAttempted ? (
                          <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2">
                            <RotateCcw className="w-4 h-4" /> Re-attempt Exam Set
                          </button>
                        ) : (
                          <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2">
                            <Zap className="w-4 h-4 fill-current text-yellow-300" /> Start Exam Set
                          </button>
                        )}
                      </Link>
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