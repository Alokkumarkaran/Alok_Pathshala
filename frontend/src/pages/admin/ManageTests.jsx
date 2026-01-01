import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import { 
  Plus, 
  Trash2, 
  Search, 
  FileText, 
  Clock, 
  Award, 
  MoreVertical, 
  AlertTriangle 
} from "lucide-react";

export default function ManageTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State for Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all tests on load
  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await api.get("/test/admin/all");
      const data = Array.isArray(res.data) ? res.data : res.data.tests || [];
      setTests(data);
    } catch (error) {
      console.error("Failed to load tests", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter tests based on search
  const filteredTests = tests.filter((test) => 
    test.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const initiateDelete = (testId) => {
    setSelectedTestId(testId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTestId) return;
    setIsDeleting(true);

    try {
      await api.delete(`/test/${selectedTestId}`);
      setTests(tests.filter((t) => t._id !== selectedTestId));
      setDeleteModalOpen(false);
    } catch (error) {
      alert("Failed to delete test.");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setSelectedTestId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* ================= HEADER SECTION ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Assessments</h1>
            <p className="text-gray-500 mt-2">Create, update, and organize your examination library.</p>
          </div>
          
          <Link to="/admin/create-test">
            <button className="group flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5 font-semibold">
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> 
              Create New Assessment
            </button>
          </Link>
        </div>

        {/* ================= TOOLBAR (SEARCH) ================= */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="relative w-full sm:max-w-md">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
               <Search size={18} />
             </div>
             <input
               type="text"
               placeholder="Search tests by title..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
             />
           </div>
           
           <div className="text-sm text-gray-500 font-medium">
             Showing {filteredTests.length} assessments
           </div>
        </div>

        {/* ================= CONTENT GRID ================= */}
        
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTests.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {searchTerm ? "No results found" : "No Assessments Created"}
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              {searchTerm 
                ? `We couldn't find any test matching "${searchTerm}".` 
                : "Get started by creating your first exam for students."}
            </p>
            {!searchTerm && (
              <Link to="/admin/create-test">
                <button className="px-6 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg hover:bg-indigo-100 transition">
                  Create First Test
                </button>
              </Link>
            )}
          </div>
        )}

        {/* Tests Grid */}
        {!loading && filteredTests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <div 
                key={test._id} 
                className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full"
              >
                {/* Decorative Side Bar */}
                <div className="absolute top-6 left-0 w-1 h-12 bg-indigo-500 rounded-r-full"></div>

                <div>
                  <div className="flex justify-between items-start mb-4 pl-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                      <FileText size={20} />
                    </div>
                    {/* Delete Button (Top Right) */}
                    <button 
                      onClick={() => initiateDelete(test._id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete Test"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 pl-3 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {test.title}
                  </h3>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 pl-3 mb-6">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      <Clock size={12} /> {test.duration}m
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                      <Award size={12} /> {test.totalMarks} Marks
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                      Pass: {test.passingMarks}
                    </span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-gray-50 flex justify-between items-center pl-3">
                  <span className="text-xs text-gray-400 font-medium">
                    ID: {test._id.slice(-6).toUpperCase()}
                  </span>
                  {/* You can add an Edit button here later */}
                  <span className="text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer">
                    Manage <ArrowRightIcon />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================
            DELETE CONFIRMATION MODAL
        ========================================= */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 transition-all p-6 text-center">
              
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <AlertTriangle size={32} className="text-red-500" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Assessment?</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                This will permanently remove <span className="font-semibold text-gray-700">this test</span> and all associated student results. This action cannot be undone.
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
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Trash2 size={18} /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

// Simple Arrow Icon Component
const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
);