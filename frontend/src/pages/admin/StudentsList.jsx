import { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import { 
  Search, 
  User, 
  Mail, 
  Calendar, 
  MoreVertical, 
  ShieldCheck, 
  Trash2, 
  AlertTriangle,
  X 
} from "lucide-react";

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State for Dropdown Menus (tracks which ID is open)
  const [openMenuId, setOpenMenuId] = useState(null);

  // State for Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/auth/students"); 
      setStudents(res.data);
    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation(); // Prevent closing immediately
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const initiateDelete = (student) => {
    setStudentToDelete(student);
    setDeleteModalOpen(true);
    setOpenMenuId(null); // Close menu
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      // ✅ REPLACE with your actual Delete API Endpoint
      // Example: await api.delete(`/admin/student/${studentToDelete._id}`);
      await api.delete(`/auth/user/${studentToDelete._id}`); 
      
      // Update UI
      setStudents(students.filter(s => s._id !== studentToDelete._id));
      setDeleteModalOpen(false);
    } catch (error) {
      alert("Failed to delete student. Please try again.");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setStudentToDelete(null);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvatarColor = (index) => {
    const colors = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-teal-500", "bg-indigo-500"];
    return colors[index % colors.length];
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Directory</h1>
            <p className="text-gray-500 mt-2">Manage student accounts and permissions.</p>
          </div>

          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* ================= TABLE CARD ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible min-h-[400px]">
          
          {loading && (
            <div className="flex flex-col items-center justify-center h-80">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Loading...</p>
            </div>
          )}

          {!loading && filteredStudents.length === 0 && (
            <div className="flex flex-col items-center justify-center h-80 text-center px-4">
              <Search size={40} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-800">No students found</h3>
            </div>
          )}

          {/* TABLE START */}
          {!loading && filteredStudents.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Joined</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((student, index) => (
                    <tr key={student._id} className="group hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${getAvatarColor(index)}`}>
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{student.name}</p>
                            <p className="text-xs text-gray-400">ID: {student._id.slice(-4).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <Mail size={14} className="text-gray-400" />
                          {student.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(student.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                          <ShieldCheck size={12} /> Active
                        </span>
                      </td>
                      
                      {/* === ACTIONS COLUMN WITH DROPDOWN === */}
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={(e) => toggleMenu(e, student._id)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === student._id && (
                          <div className="absolute right-8 top-8 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <button 
                              className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2 transition-colors"
                              onClick={() => console.log("View Profile")}
                            >
                              <User size={16} /> View Profile
                            </button>
                            <div className="h-px bg-gray-100"></div>
                            <button 
                              onClick={() => initiateDelete(student)}
                              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 size={16} /> Delete User
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ================= DELETE MODAL ================= */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <AlertTriangle size={32} className="text-red-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Student?</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Are you sure you want to delete <span className="font-bold text-gray-800">{studentToDelete?.name}</span>? 
                  This will remove their account and all exam results permanently.
                </p>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setDeleteModalOpen(false)}
                    className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}