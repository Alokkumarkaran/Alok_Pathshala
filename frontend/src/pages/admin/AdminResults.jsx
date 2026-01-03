import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import { 
  Search, Download, ChevronLeft, ChevronRight, ArrowUpDown, 
  Filter, FileCheck, User, Clock, AlertCircle, Eye, X, CheckCircle, XCircle
} from "lucide-react";

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters & State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'passed', 'failed'
  
  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  
  // Modal State
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await api.get("/exam/admin/results");
        setResults(res.data);
      } catch (err) {
        console.error("Failed to fetch results", err);
        setError("Failed to load result data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // --- NATIVE CSV EXPORT (No external library needed) ---
  const handleExport = () => {
    const headers = ["Student Name,Email,Exam Title,Score,Total Marks,Status,Date"];
    const rows = processedData.map(r => {
      const isPassed = r.score >= (r.testId?.passingMarks || 0);
      return [
        `"${r.studentId?.name || 'Unknown'}"`,
        `"${r.studentId?.email || ''}"`,
        `"${r.testId?.title || 'Deleted'}"`,
        r.score,
        r.testId?.totalMarks || 100,
        isPassed ? "Passed" : "Failed",
        new Date(r.createdAt).toLocaleDateString()
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `exam_results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- DATA PROCESSING ---
  const processedData = useMemo(() => {
    let data = [...results];

    // 1. Text Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter((r) => 
        r.studentId?.name?.toLowerCase().includes(lowerTerm) ||
        r.studentId?.email?.toLowerCase().includes(lowerTerm) ||
        r.testId?.title?.toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Status Filter
    if (statusFilter !== "all") {
      data = data.filter((r) => {
        const isPassed = r.score >= (r.testId?.passingMarks || 0);
        return statusFilter === "passed" ? isPassed : !isPassed;
      });
    }

    // 3. Sort
    if (sortConfig.key) {
      data.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === 'studentId.name') {
           aValue = a.studentId?.name || ''; bValue = b.studentId?.name || '';
        } else if (sortConfig.key === 'testId.title') {
           aValue = a.testId?.title || ''; bValue = b.testId?.title || '';
        } else {
           aValue = a[sortConfig.key]; bValue = b[sortConfig.key];
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [results, searchTerm, statusFilter, sortConfig]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // Stats Calculation
  const stats = useMemo(() => {
    const total = results.length;
    if (total === 0) return { total: 0, avg: 0, passRate: 0 };
    const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
    const passed = results.filter(r => r.score >= (r.testId?.passingMarks || 0)).length;
    return {
      total,
      avg: Math.round(totalScore / total),
      passRate: Math.round((passed / total) * 100)
    };
  }, [results]);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
             <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Exam Results</h1>
             <p className="text-gray-500 mt-1">Manage and analyze student performance.</p>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition shadow-sm active:scale-95"
          >
            <Download size={18} /> Export Data
          </button>
        </div>

        {/* ================= STATS ROW ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
           <StatCard label="Total Submissions" value={stats.total} icon={FileCheck} color="blue" />
           <StatCard label="Average Score" value={stats.avg} icon={AlertCircle} color="indigo" />
           <StatCard label="Pass Rate" value={`${stats.passRate}%`} icon={Filter} color="emerald" />
        </div>

        {/* ================= DATA TABLE CONTAINER ================= */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
          
          {/* Controls */}
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between items-center gap-4">
            
            {/* Search & Filter Group */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-80">
                  <input 
                    type="text" 
                    placeholder="Search students..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white shadow-sm"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
                
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-700 font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer shadow-sm"
                >
                  <option value="all">All Status</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
            </div>

            <div className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
               {processedData.length} Results Found
            </div>
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-xs uppercase text-gray-500 font-bold tracking-wider border-b border-gray-100">
                  <SortableHeader label="Student" sortKey="studentId.name" currentSort={sortConfig} onSort={handleSort} />
                  <SortableHeader label="Exam Title" sortKey="testId.title" currentSort={sortConfig} onSort={handleSort} />
                  <SortableHeader label="Score" sortKey="score" currentSort={sortConfig} onSort={handleSort} align="center" />
                  <th className="px-6 py-4 text-center">Status</th>
                  <SortableHeader label="Date" sortKey="createdAt" currentSort={sortConfig} onSort={handleSort} align="right" />
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                ) : error ? (
                  <tr><td colSpan="6" className="p-8 text-center text-red-500">{error}</td></tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-24 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <Filter className="w-16 h-16 mb-4 opacity-10" />
                        <p className="text-lg font-medium text-gray-500">No matching results</p>
                        <p className="text-sm">Try clearing your filters or search.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {paginatedData.map((r, i) => (
                      <ResultRow 
                        key={r._id || i} 
                        result={r} 
                        index={i} 
                        searchTerm={searchTerm} 
                        onView={() => setSelectedResult(r)}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
             <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
             </div>
          )}
        </div>
      </div>

      {/* ================= DETAIL MODAL ================= */}
      <AnimatePresence>
        {selectedResult && (
          <ResultDetailModal result={selectedResult} onClose={() => setSelectedResult(null)} />
        )}
      </AnimatePresence>

    </AdminLayout>
  );
}

// ================= SUB-COMPONENTS =================

const ResultDetailModal = ({ result, onClose }) => {
  const isPassed = result.score >= (result.testId?.passingMarks || 0);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className={`p-6 text-white flex justify-between items-start ${isPassed ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              {isPassed ? <CheckCircle size={24} /> : <XCircle size={24} />}
              {isPassed ? "Result: Passed" : "Result: Failed"}
            </h2>
            <p className="text-white/80 text-sm mt-1">{result.testId?.title}</p>
          </div>
          <button onClick={onClose} className="bg-white/20 p-1 rounded-full hover:bg-white/30 transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-500">
                {result.studentId?.name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{result.studentId?.name}</h3>
                <p className="text-gray-500 text-sm">{result.studentId?.email}</p>
                <p className="text-gray-400 text-xs mt-1">ID: {result.studentId?._id}</p>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="bg-gray-50 p-3 rounded-xl text-center">
                 <p className="text-xs text-gray-400 uppercase font-bold">Score</p>
                 <p className="text-2xl font-black text-gray-900">{result.score}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl text-center">
                 <p className="text-xs text-gray-400 uppercase font-bold">Total Marks</p>
                 <p className="text-2xl font-black text-gray-400">{result.testId?.totalMarks || 100}</p>
              </div>
           </div>
           
           <div className="text-xs text-center text-gray-400 pt-2">
             Submitted on {new Date(result.createdAt).toLocaleString()}
           </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition shadow-sm">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600"
  };
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-black text-gray-900">{value}</h3>
      </div>
    </div>
  );
};

const SortableHeader = ({ label, sortKey, currentSort, onSort, align = "left" }) => (
  <th 
    className={`px-6 py-4 cursor-pointer group hover:bg-gray-100 transition-colors text-${align}`}
    onClick={() => onSort(sortKey)}
  >
    <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"}`}>
      {label}
      <ArrowUpDown size={14} className={`transition-opacity ${currentSort.key === sortKey ? "opacity-100 text-indigo-600" : "opacity-30 group-hover:opacity-60"}`} />
    </div>
  </th>
);

// Highlight Helper
const HighlightText = ({ text, highlight }) => {
  if (!highlight || !text) return <span>{text || ""}</span>;
  const parts = text.toString().split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() 
          ? <span key={i} className="bg-yellow-100 text-yellow-800 rounded px-0.5">{part}</span> 
          : part
      )}
    </span>
  );
};

const ResultRow = ({ result, index, searchTerm, onView }) => {
  const isPassed = result.score >= (result.testId?.passingMarks || 0);

  return (
    <motion.tr 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ delay: index * 0.05 }}
      className="hover:bg-indigo-50/30 transition-colors group border-b border-gray-50 last:border-0"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 uppercase shadow-sm border border-indigo-200">
             {result.studentId?.name?.charAt(0) || <User size={16} />}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-800 text-sm">
              <HighlightText text={result.studentId?.name} highlight={searchTerm} />
            </span>
            <span className="text-xs text-gray-400">{result.studentId?.email}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
          <HighlightText text={result.testId?.title || "Deleted Exam"} highlight={searchTerm} />
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex flex-col items-center">
          <span className="text-sm font-black text-gray-900">{result.score}</span>
          <span className="text-[10px] uppercase font-bold text-gray-400">Marks</span>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
          isPassed ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {isPassed ? "Passed" : "Failed"}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-600 font-medium">
            {new Date(result.createdAt).toLocaleDateString()}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
             <Clock size={10} />
             {new Date(result.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <button 
          onClick={onView}
          className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95"
          title="View Details"
        >
          <Eye size={18} />
        </button>
      </td>
    </motion.tr>
  );
};

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-50">
    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-100 rounded-full"></div><div className="h-4 w-32 bg-gray-100 rounded"></div></div></td>
    <td className="px-6 py-4"><div className="h-6 w-24 bg-gray-100 rounded"></div></td>
    <td className="px-6 py-4"><div className="h-4 w-8 bg-gray-100 rounded mx-auto"></div></td>
    <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-100 rounded-full mx-auto"></div></td>
    <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-100 rounded ml-auto"></div></td>
    <td className="px-6 py-4"><div className="h-8 w-8 bg-gray-100 rounded mx-auto"></div></td>
  </tr>
);