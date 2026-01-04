import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import { 
  Plus, Trash2, Search, FileText, Clock, Award, 
  MoreVertical, AlertTriangle, Calendar, LayoutGrid, Library,
  List as ListIcon, Edit, Copy, BarChart2, CheckCircle, XCircle
} from "lucide-react";

export default function ManageTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & View State
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'alpha'
  
  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null); // For dropdowns

  // Fetch Data
  useEffect(() => {
    fetchTests();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/test/admin/all");
      const data = Array.isArray(res.data) ? res.data : res.data.tests || [];
      setTests(data);
    } catch (error) {
      console.error("Failed to load tests", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: Filter & Sort ---
  const processedTests = useMemo(() => {
    let result = [...tests];

    // 1. Search
    if (searchTerm) {
      result = result.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // 2. Sort
    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === "alpha") return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [tests, searchTerm, sortBy]);

  // --- ACTIONS ---
  const initiateDelete = (e, testId) => {
    e.stopPropagation(); // Prevent card click
    setSelectedTestId(testId);
    setDeleteModalOpen(true);
    setActiveMenu(null);
  };

  const confirmDelete = async () => {
    if (!selectedTestId) return;
    setIsDeleting(true);
    try {
      // The backend should handle deleting questions associated with this test ID
      await api.delete(`/test/${selectedTestId}`);
      
      // Update UI state locally
      setTests(tests.filter((t) => t._id !== selectedTestId));
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete test. Please check your connection.");
    } finally {
      setIsDeleting(false);
      setSelectedTestId(null);
    }
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveMenu(activeMenu === id ? null : id);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2 min-h-screen">
        
       {/* ================= HEADER ================= */}
<div className="relative bg-gradient-to-br from-indigo-50 via-white to-white border border-indigo-100 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm overflow-hidden">
  
  {/* Decorative Background Element */}
  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-100 opacity-50 blur-3xl pointer-events-none"></div>

  <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
    
    {/* Text Section */}
    <div className="space-y-2">
      <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
        Assessment Library
      </h1>
      <p className="text-gray-500 font-medium text-lg max-w-xl">
        Manage your exams and quizzes. Organize your curriculum efficiently.
      </p>
    </div>

    {/* Button Section */}
    <Link to="/admin/create-test" className="shrink-0">
      <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-bold transform hover:-translate-y-1 active:scale-95 group">
        <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" /> 
        Create Assessment
      </button>
    </Link>
  </div>
</div>
        {/* ================= TOOLBAR ================= */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center gap-3">
           
           {/* Search */}
           <div className="relative w-full md:flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
             <input
               type="text"
               placeholder="Search assessments..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-indigo-500 rounded-xl transition-all outline-none font-medium"
             />
           </div>

           <div className="flex w-full md:w-auto gap-3">
             {/* Sort Dropdown */}
             <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-transparent hover:bg-white hover:border-gray-200 rounded-xl text-gray-700 font-bold text-sm cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/20"
             >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alpha">A-Z Title</option>
             </select>

             {/* View Toggle */}
             <div className="flex bg-gray-100 p-1 rounded-xl">
               <button 
                 onClick={() => setViewMode("grid")}
                 className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 <LayoutGrid size={20} />
               </button>
               <button 
                 onClick={() => setViewMode("list")}
                 className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 <ListIcon size={20} />
               </button>
             </div>
           </div>
        </div>

        {/* ================= CONTENT AREA ================= */}
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : processedTests.length === 0 ? (
          <EmptyState searchTerm={searchTerm} />
        ) : (
          <motion.div 
            layout 
            className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-3"}
          >
            <AnimatePresence>
              {processedTests.map((test) => (
                viewMode === 'grid' 
                  ? <GridCard key={test._id} test={test} onDelete={initiateDelete} activeMenu={activeMenu} toggleMenu={toggleMenu} />
                  : <ListRow key={test._id} test={test} onDelete={initiateDelete} activeMenu={activeMenu} toggleMenu={toggleMenu} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Delete Modal */}
        {deleteModalOpen && (
          <DeleteModal 
            onClose={() => setDeleteModalOpen(false)} 
            onConfirm={confirmDelete} 
            isDeleting={isDeleting} 
          />
        )}
      </div>
    </AdminLayout>
  );
}

// ================= SUB-COMPONENTS =================

const GridCard = ({ test, onDelete, activeMenu, toggleMenu }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
  >
    <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>

    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <FileText size={24} />
        </div>
        
        <div className="relative">
          <button 
            onClick={(e) => toggleMenu(e, test._id)}
            className="p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <MoreVertical size={20} />
          </button>
          
          {activeMenu === test._id && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
              <button className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Edit size={16} /> Edit Exam
              </button>
              <button className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <BarChart2 size={16} /> Analytics
              </button>
              <div className="h-px bg-gray-100 my-0"></div>
              <button 
                onClick={(e) => onDelete(e, test._id)}
                className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 h-14">
        {test.title}
      </h3>

      <div className="space-y-3 mb-6">
        <InfoBadge icon={Clock} text={`${test.duration} mins`} color="blue" />
        <InfoBadge icon={Award} text={`${test.totalMarks} Total Marks`} color="purple" />
        <InfoBadge icon={CheckCircle} text={`Pass: ${test.passingMarks}`} color="green" />
      </div>

      <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400 font-medium">
        <span>Created {new Date(test.createdAt || Date.now()).toLocaleDateString()}</span>
        <span className="font-mono bg-gray-100 px-2 py-1 rounded">ID: {test._id.slice(-4)}</span>
      </div>
    </div>
  </motion.div>
);

const ListRow = ({ test, onDelete, activeMenu, toggleMenu }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-6"
  >
    <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
      <FileText size={20} />
    </div>
    
    <div className="flex-1 min-w-0">
      <h3 className="text-base font-bold text-gray-900 truncate">{test.title}</h3>
      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Clock size={12} /> {test.duration}m</span>
        <span className="flex items-center gap-1"><Award size={12} /> {test.totalMarks} pts</span>
        <span className="hidden sm:inline">Created {new Date(test.createdAt || Date.now()).toLocaleDateString()}</span>
      </div>
    </div>

    <div className="flex items-center gap-2">
       <button onClick={(e) => onDelete(e, test._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
         <Trash2 size={18} />
       </button>
       <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
         <Edit size={18} />
       </button>
    </div>
  </motion.div>
);

const InfoBadge = ({ icon: Icon, text, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100"
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${colors[color]}`}>
      <Icon size={14} /> {text}
    </div>
  );
};

// UPDATED MODAL TO REFLECT DATABASE CHANGES
const DeleteModal = ({ onClose, onConfirm, isDeleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center transform scale-100 transition-all">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={32} className="text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Assessment?</h3>
      <p className="text-gray-500 text-sm mb-6">
        <span className="block font-bold text-red-500 mb-1">Warning: Irreversible Action</span>
        Deleting this exam will permanently remove:
        <br/>• The Exam itself
        <br/>• <span className="font-semibold text-gray-700">All Questions inside it</span>
        <br/>• All Student Results
      </p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={isDeleting} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition flex items-center justify-center gap-2">
          {isDeleting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <><Trash2 size={18} /> Confirm Delete</>}
        </button>
      </div>
    </div>
  </div>
);

const EmptyState = ({ searchTerm }) => (
  <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-200 flex flex-col items-center">
    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
      <FileText size={40} className="text-gray-300" />
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">
      {searchTerm ? "No matches found" : "No Assessments Yet"}
    </h3>
    <p className="text-gray-500 max-w-sm mb-6">
      {searchTerm ? `We couldn't find anything matching "${searchTerm}".` : "Start building your question bank and creating exams."}
    </p>
    {!searchTerm && (
      <Link to="/admin/create-test">
        <button className="px-6 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg hover:bg-indigo-100 transition">
          Create First Exam
        </button>
      </Link>
    )}
  </div>
);