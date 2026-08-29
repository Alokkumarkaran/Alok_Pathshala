import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import { PenTool, Sparkles, Folder, Layers } from "lucide-react";

export default function CreateTest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFolderId = searchParams.get("folderId") || "";

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTest, setCreatedTest] = useState(null);
  const [folders, setFolders] = useState([]);

  const [form, setForm] = useState({
    title: "",
    setName: "Set 1",
    folderId: initialFolderId,
    duration: "",
    totalMarks: "",
    passingMarks: "",
  });

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const res = await api.get("/folders/all");
      const list = res.data || [];
      setFolders(list);
      if (!form.folderId && list.length > 0) {
        setForm((prev) => ({ ...prev, folderId: list[0]._id }));
      }
    } catch (err) {
      console.error("Failed to load folders", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/test/create", form);
      setCreatedTest(res.data);
      setShowSuccessModal(true);
      
      setForm({
        title: "",
        setName: "Set 1",
        folderId: form.folderId || (folders[0] ? folders[0]._id : ""),
        duration: "",
        totalMarks: "",
        passingMarks: "",
      });
    } catch (error) {
      alert("Failed to create test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all bg-gray-50 text-gray-800 placeholder-gray-400";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-50 via-white to-white border border-indigo-100 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                <PenTool size={24} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                  Create Exam Set
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full border border-indigo-200 uppercase tracking-wide">
                    New Set
                  </span>
                </h1>
                <p className="text-gray-500 mt-2 font-medium text-lg">
                  Assign set to an Exam Folder (Category) and configure exam details.
                </p>
              </div>
            </div>

            <div className="hidden md:block text-indigo-200">
              <Sparkles size={48} strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative">
          <div className="h-2 bg-indigo-600 w-full absolute top-0 left-0"></div>

          <div className="p-6 md:p-8 pt-8">
            <form onSubmit={handleSubmit}>

              {/* Folder & Set Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className={labelClass}>Select Exam Folder / Category</label>
                  <select
                    name="folderId"
                    value={form.folderId}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    {folders.map((f) => (
                      <option key={f._id} value={f._id}>
                        📁 {f.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Set Name / Number</label>
                  <input
                    type="text"
                    name="setName"
                    placeholder="e.g. Set 1, Set 2, Mock Test 1"
                    value={form.setName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
              
              {/* Test Title */}
              <div className="mb-6">
                <label className={labelClass}>Exam Set Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Mathematics Practice Set 1"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* Grid for Numeric Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className={labelClass}>Duration (Minutes)</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="duration"
                      placeholder="60"
                      value={form.duration}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                    <span className="absolute right-4 top-3.5 text-gray-400 text-sm font-medium">min</span>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Total Marks</label>
                  <input
                    type="number"
                    name="totalMarks"
                    placeholder="100"
                    value={form.totalMarks}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Passing Marks</label>
                  <input
                    type="number"
                    name="passingMarks"
                    placeholder="33"
                    value={form.passingMarks}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setForm({ title: "", setName: "Set 1", folderId: folders[0]?._id || "", duration: "", totalMarks: "", passingMarks: "" })}
                  className="w-full md:w-auto px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                >
                  Reset Form
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full md:w-auto px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 hover:shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <span>Creating Set...</span>
                  ) : (
                    <span>Create Exam Set</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* SUCCESS MODAL */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-green-50 p-6 flex flex-col items-center justify-center border-b border-green-100">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 ring-8 ring-green-50">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Exam Set Created!</h3>
                <p className="text-sm text-gray-500 mt-1 text-center">
                  "{createdTest?.title}" has been added under the selected folder.
                </p>
              </div>

              <div className="p-6 space-y-3">
                <Link to={`/admin/add-question?testId=${createdTest?._id}`}>
                  <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2">
                    Add Single Question
                  </button>
                </Link>

                <Link to={`/admin/bulk-upload?testId=${createdTest?._id}`}>
                  <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2">
                    Bulk Upload Questions (Excel/JSON)
                  </button>
                </Link>

                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                >
                  Create Another Set
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}