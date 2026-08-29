import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Folder,
  FolderPlus,
  Search,
  Plus,
  Trash2,
  Edit,
  ArrowRight,
  Layers,
  HelpCircle,
  AlertTriangle,
  X
} from "lucide-react";

export default function AdminExamFolders() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryIcon: "folder",
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Confirmation Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFolderForDelete, setSelectedFolderForDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await api.get("/folders/all");
      } catch (getErr) {
        if (getErr.response?.status === 404) {
          res = await api.get("/folders");
        } else {
          throw getErr;
        }
      }
      setFolders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch exam folders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingFolder(null);
    setFormData({ title: "", description: "", categoryIcon: "folder" });
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (folder) => {
    setEditingFolder(folder);
    setFormData({
      title: folder.title || "",
      description: folder.description || "",
      categoryIcon: folder.categoryIcon || "folder",
    });
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg("Folder title is required.");
      return;
    }

    try {
      setSaving(true);
      if (editingFolder) {
        await api.put(`/folders/${editingFolder._id}`, formData);
      } else {
        try {
          await api.post("/folders/create", formData);
        } catch (postErr) {
          if (postErr.response?.status === 404) {
            await api.post("/folders", formData);
          } else {
            throw postErr;
          }
        }
      }
      setModalOpen(false);
      fetchFolders();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to save exam folder");
    } finally {
      setSaving(false);
    }
  };

  // Delete Modal Actions
  const initiateDelete = (folder) => {
    setSelectedFolderForDelete(folder);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFolderForDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/folders/${selectedFolderForDelete._id}`);
      setDeleteModalOpen(false);
      setSelectedFolderForDelete(null);
      fetchFolders();
    } catch (err) {
      alert("Failed to delete exam folder from database.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredFolders = folders.filter((f) =>
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalSets = folders.reduce((acc, f) => acc + (f.totalSets || 0), 0);
  const totalQuestions = folders.reduce((acc, f) => acc + (f.totalQuestions || 0), 0);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2 space-y-6">
        
        {/* HEADER SECTION */}
        <div className="relative bg-gradient-to-br from-indigo-50 via-white to-white border border-indigo-100 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                <Folder size={26} strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wide">
                    Exam Hierarchy Manager
                  </span>
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  Exam Folders & Categories
                </h1>
                <p className="text-gray-500 mt-1 font-medium text-sm max-w-2xl">
                  Organize your assessments into structured Exam Folders (Categories) containing multiple Exam Sets (Set 1, Set 2, etc.).
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition transform active:scale-95 self-start md:self-auto"
            >
              <FolderPlus className="w-5 h-5" /> Create Exam Folder
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Exam Folders</p>
              <h3 className="text-2xl font-black text-slate-900">{folders.length}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Exam Sets</p>
              <h3 className="text-2xl font-black text-slate-900">{totalSets}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Questions</p>
              <h3 className="text-2xl font-black text-slate-900">{totalQuestions}</h3>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search exam folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
            />
          </div>
        </div>

        {/* FOLDERS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-60 bg-white border border-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredFolders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 space-y-4">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <Folder className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Exam Folders Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Get started by creating your first Exam Folder to organize test sets.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-md hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" /> Create Exam Folder
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFolders.map((folder) => (
              <motion.div
                key={folder._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Folder className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(folder)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
                        title="Edit Folder"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => initiateDelete(folder)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition"
                        title="Delete Folder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {folder.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {folder.description || "No description provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Exam Sets</span>
                      <span className="text-base font-black text-indigo-600">
                        {folder.totalSets || 0} Sets
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Questions</span>
                      <span className="text-base font-black text-purple-600">
                        {folder.totalQuestions || 0} Qs
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/admin/create-test?folderId=${folder._id}`}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Set
                  </Link>

                  <Link
                    to={`/admin/folders/${folder._id}/sets`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5 shadow-sm"
                  >
                    View Sets <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CREATE / EDIT MODAL */}
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Folder className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {editingFolder ? "Edit Exam Folder" : "Create New Exam Folder"}
                    </h3>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl font-medium border border-red-100">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                      Folder Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SSC CGL 2026, Class 10th Science"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Details about tests in this folder..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md disabled:opacity-50"
                    >
                      {saving ? "Saving..." : editingFolder ? "Update Folder" : "Create Folder"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Exam Folder?</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  <span className="block font-bold text-red-500 mb-1">Warning: Permanent Database Deletion</span>
                  Deleting <strong className="text-gray-800">"{selectedFolderForDelete?.title}"</strong> will permanently delete:
                  <br />• <span className="font-semibold text-gray-800">The Exam Folder</span>
                  <br />• <span className="font-semibold text-gray-800">All Exam Sets inside it ({selectedFolderForDelete?.totalSets || 0})</span>
                  <br />• <span className="font-semibold text-gray-800">All Questions inside all sets</span>
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
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Trash2 size={18} /> Delete All
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
