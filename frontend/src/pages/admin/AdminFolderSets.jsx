import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Folder,
  Layers,
  Plus,
  ArrowLeft,
  Trash2,
  Clock,
  Award,
  Upload,
  HelpCircle,
  AlertTriangle,
  ChevronRight
} from "lucide-react";

export default function AdminFolderSets() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  
  const [folder, setFolder] = useState(null);
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSetForDelete, setSelectedSetForDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchFolderSets();
  }, [folderId]);

  const fetchFolderSets = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/folders/${folderId}/sets`);
      setFolder(res.data.folder || null);
      setSets(res.data.sets || []);
    } catch (err) {
      console.error("Failed to fetch folder sets", err);
    } finally {
      setLoading(false);
    }
  };

  const initiateDeleteSet = (set) => {
    setSelectedSetForDelete(set);
    setDeleteModalOpen(true);
  };

  const confirmDeleteSet = async () => {
    if (!selectedSetForDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/test/${selectedSetForDelete._id}`);
      setDeleteModalOpen(false);
      setSelectedSetForDelete(null);
      fetchFolderSets();
    } catch (err) {
      alert("Failed to delete exam set from database.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2 space-y-6">
        {/* BREADCRUMB NAVIGATION */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Link to="/admin/folders" className="hover:text-indigo-600 flex items-center gap-1">
            <Folder className="w-3.5 h-3.5" /> Exam Folders
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold">{folder?.title || "Folder Sets"}</span>
        </div>

        {/* LIGHT MODE HEADER SECTION */}
        <div className="relative bg-gradient-to-br from-indigo-50 via-white to-white border border-indigo-100 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <button
                onClick={() => navigate("/admin/folders")}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition shadow-xs"
              >
                <ArrowLeft className="w-5 h-5 text-indigo-600" />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wide">
                    Exam Folder
                  </span>
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  {folder?.title || "Exam Folder"}
                </h1>
                <p className="text-gray-500 mt-1 font-medium text-sm max-w-xl">
                  {folder?.description || "Manage all exam sets (Set 1, Set 2, etc.) under this category folder."}
                </p>
              </div>
            </div>

            <Link
              to={`/admin/create-test?folderId=${folderId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition transform active:scale-95 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" /> Create Exam Set
            </Link>
          </div>
        </div>

        {/* SETS LIST */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white border border-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : sets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 space-y-4">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Exam Sets in this Folder</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Create your first Exam Set (e.g. Set 1, Set 2) to start adding questions for students!
            </p>
            <Link
              to={`/admin/create-test?folderId=${folderId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-md"
            >
              <Plus className="w-4 h-4" /> Create Exam Set
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sets.map((set, idx) => (
              <motion.div
                key={set._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                      {set.setName || `Set ${idx + 1}`}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {set.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                      {set.questions?.length || 0} Questions
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      {set.duration} Mins
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      {set.totalMarks} Marks (Pass: {set.passingMarks})
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                  <Link
                    to={`/admin/add-question?testId=${set._id}`}
                    className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Single Q
                  </Link>

                  <Link
                    to={`/admin/bulk-upload?testId=${set._id}`}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> Bulk Upload
                  </Link>

                  <button
                    onClick={() => initiateDeleteSet(set)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-xl transition"
                    title="Delete Exam Set"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CUSTOM CONFIRMATION DELETE MODAL */}
        <AnimatePresence>
          {deleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center"
              >
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Exam Set?</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  <span className="block font-bold text-red-500 mb-1">Warning: Permanent Database Deletion</span>
                  Deleting <strong className="text-gray-800">"{selectedSetForDelete?.title}"</strong> will permanently delete:
                  <br />• <span className="font-semibold text-gray-800">The Exam Set</span>
                  <br />• <span className="font-semibold text-gray-800">All Questions inside it ({selectedSetForDelete?.questions?.length || 0})</span>
                  <br />• <span className="font-semibold text-gray-800">All Student Results & Attempts</span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModalOpen(false)}
                    className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteSet}
                    disabled={isDeleting}
                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Trash2 size={18} /> Confirm Delete
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
}
