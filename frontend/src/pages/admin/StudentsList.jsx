import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import { 
  Search, User, Mail, Calendar, Trash2, AlertTriangle, X, 
  LayoutGrid, List as ListIcon, CheckSquare, Square, 
  ChevronLeft, ChevronRight, Users, UserPlus, Filter, 
  ExternalLink, MoreHorizontal, Download 
} from "lucide-react";

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View & Filter State
  const [viewMode, setViewMode] = useState("list"); // Default view
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  
  // Mobile Specific State
  const [isMobileSelectMode, setIsMobileSelectMode] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Selection & Modal State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedStudent, setSelectedStudent] = useState(null); // Drawer
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/students");
      setStudents(res.data);
    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setLoading(false);
    }
  };

  // --- STATS ---
  const stats = useMemo(() => {
    const total = students.length;
    const now = new Date();
    const newThisMonth = students.filter(s => {
      const d = new Date(s.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return { total, newThisMonth };
  }, [students]);

  // --- FILTER & SORT ---
  const processedData = useMemo(() => {
    let data = [...students];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(s => s.name.toLowerCase().includes(lower) || s.email.toLowerCase().includes(lower));
    }
    if (dateFilter === 'new') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      data = data.filter(s => new Date(s.createdAt) > sevenDaysAgo);
    }
    data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return data;
  }, [students, searchTerm, dateFilter]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- HANDLERS ---
  
  // 1. Selection Handler (Works for both Checkbox click and Row click in Select Mode)
  const handleSelection = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  // 2. Row Click Handler (Smart Logic)
  const handleRowClick = (student) => {
    // On Mobile: If "Select Mode" is active, clicking row toggles selection
    if (isMobileSelectMode) {
      handleSelection(student._id);
    } else {
      // Otherwise, open the drawer
      setSelectedStudent(student);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteTarget === 'bulk') {
        await Promise.all(Array.from(selectedIds).map(id => api.delete(`/auth/user/${id}`)));
        setStudents(p => p.filter(s => !selectedIds.has(s._id)));
        setSelectedIds(new Set());
        setIsMobileSelectMode(false);
      } else {
        await api.delete(`/auth/user/${deleteTarget._id}`);
        setStudents(p => p.filter(s => s._id !== deleteTarget._id));
      }
      setDeleteModalOpen(false);
      setSelectedStudent(null);
    } catch (err) { alert("Failed to delete"); } finally { setIsDeleting(false); }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-screen relative pb-24">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Student Directory</h1>
            <p className="text-gray-500 mt-1 font-medium">Manage user access and profiles.</p>
          </div>
          
          {/* Stats - Horizontal Scroll on Mobile */}
          <div className="flex gap-3 w-full lg:w-auto overflow-x-auto pb-2 no-scrollbar">
             <StatCard icon={Users} label="Total Users" value={stats.total} color="blue" />
             <StatCard icon={UserPlus} label="New (30d)" value={stats.newThisMonth} color="green" />
          </div>
        </div>

        {/* ================= TOOLBAR ================= */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-3 sticky top-2 z-30">
           {/* Search Input */}
           <div className="relative w-full md:flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
             <input
               type="text"
               placeholder="Search students..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 rounded-xl transition-all outline-none font-medium text-sm sm:text-base"
             />
           </div>

           {/* Actions Row */}
           <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar w-full md:w-auto">
              
              {/* Mobile Select Toggle Button */}
              <button 
                onClick={() => {
                  setIsMobileSelectMode(!isMobileSelectMode);
                  setSelectedIds(new Set()); // Clear selection when toggling off
                }} 
                className={`md:hidden p-3 rounded-xl border font-bold text-sm whitespace-nowrap transition-colors ${isMobileSelectMode ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-700'}`}
              >
                {isMobileSelectMode ? 'Done Selecting' : 'Select Items'}
              </button>

              {/* Filter Dropdown */}
              <div className="relative shrink-0">
                <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="appearance-none pl-9 pr-8 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold text-sm outline-none"
                >
                  <option value="all">All Time</option>
                  <option value="new">Recent</option>
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>

              {/* View Toggles (Hidden on very small screens if needed, usually fit) */}
              <div className="hidden sm:flex bg-gray-100 p-1 rounded-xl shrink-0">
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}><ListIcon size={20} /></button>
                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}><LayoutGrid size={20} /></button>
              </div>
           </div>
        </div>

        {/* ================= CONTENT LIST/GRID ================= */}
        {loading ? (
           <div className="space-y-4">
             {[1,2,3,4].map(i => <div key={i} className="bg-gray-100 h-20 rounded-2xl animate-pulse"></div>)}
           </div>
        ) : processedData.length === 0 ? (
           <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><User size={32} className="text-gray-300" /></div>
             <h3 className="text-lg font-bold text-gray-800">No students found</h3>
           </div>
        ) : (
          <>
            <motion.div layout className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-2"}>
              <AnimatePresence>
                {paginatedData.map((student) => (
                  viewMode === 'grid' 
                    ? <GridCard 
                        key={student._id} 
                        student={student} 
                        selected={selectedIds.has(student._id)} 
                        onToggle={() => handleSelection(student._id)} // Checkbox click
                        onClick={() => handleRowClick(student)}       // Card click
                        selectMode={isMobileSelectMode}
                      />
                    : <ListRow 
                        key={student._id} 
                        student={student} 
                        selected={selectedIds.has(student._id)} 
                        onToggle={() => handleSelection(student._id)} // Checkbox click
                        onClick={() => handleRowClick(student)}       // Row click
                        selectMode={isMobileSelectMode}
                      />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-4 pb-20 md:pb-0">
                 <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2.5 rounded-xl bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50"><ChevronLeft size={20} /></button>
                 <span className="text-sm font-bold text-gray-600">Page {currentPage} / {totalPages}</span>
                 <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2.5 rounded-xl bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50"><ChevronRight size={20} /></button>
              </div>
            )}
          </>
        )}

        {/* ================= FLOATING ACTION BAR (BULK DELETE) ================= */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-[400px] bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between gap-6 z-40"
            >
               <span className="font-bold whitespace-nowrap">{selectedIds.size} Selected</span>
               <div className="flex items-center gap-3">
                 <button onClick={() => { setSelectedIds(new Set()); setIsMobileSelectMode(false); }} className="text-gray-400 text-sm font-medium px-2">Cancel</button>
                 <button onClick={() => { setDeleteTarget('bulk'); setDeleteModalOpen(true); }} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-red-900/50 active:scale-95 transition-transform">
                   <Trash2 size={16} /> Delete
                 </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= DRAWERS & MODALS ================= */}
        <AnimatePresence>
          {selectedStudent && (
            <StudentDrawer 
              student={selectedStudent} 
              onClose={() => setSelectedStudent(null)} 
              onDelete={() => { setDeleteTarget(selectedStudent); setDeleteModalOpen(true); }} 
            />
          )}
        </AnimatePresence>

        {deleteModalOpen && (
          <DeleteModal 
            onClose={() => setDeleteModalOpen(false)} 
            onConfirm={confirmDelete} 
            isDeleting={isDeleting} 
            count={deleteTarget === 'bulk' ? selectedIds.size : 1} 
            name={deleteTarget !== 'bulk' ? deleteTarget?.name : null} 
          />
        )}
      </div>
    </AdminLayout>
  );
}

// ================= SUB-COMPONENTS =================

const StatCard = ({ icon: Icon, label, value, color }) => {
  const styles = { blue: "bg-blue-50 text-blue-600", green: "bg-emerald-50 text-emerald-600" };
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border border-transparent flex-1 min-w-[150px] ${styles[color]}`}>
       <Icon size={20} />
       <div>
         <p className="text-[10px] uppercase font-bold opacity-60">{label}</p>
         <p className="text-xl font-black leading-none">{value}</p>
       </div>
    </div>
  );
};

// --- LIST ROW (SMART INTERACTION) ---
const ListRow = ({ student, selected, onToggle, onClick, selectMode }) => {
  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${student.name}&backgroundColor=4f46e5,0ea5e9,8b5cf6`;

  return (
    <motion.div 
      layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      onClick={onClick} // Row click -> Drawer OR Select (if mobile mode)
      className={`relative flex items-center gap-3 p-3 md:p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer ${selected ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/10' : 'border-gray-100'}`}
    >
      {/* Checkbox:
          - Visible on Desktop always
          - Visible on Mobile ONLY if selectMode is active
      */}
      <div 
        onClick={(e) => { e.stopPropagation(); onToggle(); }} // Stop row click, just toggle
        className={`shrink-0 p-2 -ml-2 text-gray-300 ${selected ? 'text-indigo-600' : ''} ${!selectMode ? 'hidden md:block' : 'block'}`}
      >
        {selected ? <CheckSquare size={22} /> : <Square size={22} />}
      </div>
      
      <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 truncate text-sm sm:text-base">{student.name}</h4>
        <p className="text-xs text-gray-500 truncate">{student.email}</p>
      </div>

      <div className="hidden md:flex items-center text-xs text-gray-400 gap-1">
        <Calendar size={12} /> {new Date(student.createdAt).toLocaleDateString()}
      </div>

      {!selectMode && <MoreHorizontal size={20} className="text-gray-300 shrink-0" />}
    </motion.div>
  );
};

// --- GRID CARD (SMART INTERACTION) ---
const GridCard = ({ student, selected, onToggle, onClick, selectMode }) => (
  <motion.div 
    layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
    onClick={onClick}
    className={`relative bg-white p-5 rounded-2xl border shadow-sm transition-all active:scale-95 cursor-pointer ${selected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-100'}`}
  >
    <div className="flex justify-between items-start mb-3">
       <img src={`https://api.dicebear.com/9.x/initials/svg?seed=${student.name}&backgroundColor=4f46e5`} alt="av" className="w-12 h-12 rounded-full border border-gray-100" />
       
       {/* Checkbox Logic same as ListRow */}
       <button 
         onClick={(e) => { e.stopPropagation(); onToggle(); }}
         className={`${!selectMode ? 'hidden md:block' : 'block'} ${selected ? 'text-indigo-600' : 'text-gray-300'}`}
       >
         {selected ? <CheckSquare size={24} /> : <Square size={24} />}
       </button>
    </div>
    
    <h3 className="font-bold text-gray-900 text-base line-clamp-1">{student.name}</h3>
    <p className="text-xs text-gray-500 mb-3 line-clamp-1">{student.email}</p>
    
    <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
       <span>Joined</span>
       <span>{new Date(student.createdAt).toLocaleDateString()}</span>
    </div>
  </motion.div>
);

const StudentDrawer = ({ student, onClose, onDelete }) => (
  <>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[60]" />
    
    {/* Full Screen on Mobile, Side Drawer on Desktop */}
    <motion.div 
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-y-0 right-0 w-full md:max-w-md bg-white shadow-2xl z-[70] overflow-y-auto"
    >
      <div className="relative h-32 bg-indigo-600">
         <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 text-white rounded-full active:scale-90 transition-transform"><X size={20} /></button>
      </div>
      <div className="px-6 -mt-12 pb-8">
         <img src={`https://api.dicebear.com/9.x/initials/svg?seed=${student.name}`} className="w-24 h-24 rounded-full border-4 border-white bg-white mb-3 shadow-lg" />
         <h2 className="text-2xl font-black text-gray-900 leading-tight">{student.name}</h2>
         <p className="text-gray-500 font-medium text-sm mt-1">{student.email}</p>
         
         <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
               <p className="text-[10px] font-bold text-gray-400 uppercase">Joined</p>
               <p className="font-bold text-gray-900 text-sm mt-1">{new Date(student.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
               <p className="text-[10px] font-bold text-gray-400 uppercase">ID</p>
               <p className="font-bold text-gray-900 text-sm mt-1 font-mono">{student._id.slice(-6).toUpperCase()}</p>
            </div>
         </div>

         <div className="mt-8 space-y-3">
            <button onClick={() => alert("Navigate to results")} className="w-full py-3.5 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center gap-2">
               <ExternalLink size={18} /> View History
            </button>
            <button onClick={onDelete} className="w-full py-3.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 active:bg-red-200 flex items-center justify-center gap-2">
               <Trash2 size={18} /> Delete Student
            </button>
         </div>
      </div>
    </motion.div>
  </>
);

const DeleteModal = ({ onClose, onConfirm, isDeleting, count, name }) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
      <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><AlertTriangle size={28} /></div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Delete {count > 1 ? `${count} Users` : "User"}?</h3>
      <p className="text-gray-500 text-sm mb-6">{name ? `Permanently remove ${name}?` : "This action cannot be undone."}</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold active:bg-gray-50">Cancel</button>
        <button onClick={onConfirm} disabled={isDeleting} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold active:bg-red-700">{isDeleting ? "..." : "Delete"}</button>
      </div>
    </div>
  </div>
);