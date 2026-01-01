import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";

export default function BulkUpload() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState("");
  const [jsonData, setJsonData] = useState("");
  const [loading, setLoading] = useState(false);
  
  // UI States
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  // Load all exams for dropdown
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await api.get("/test/admin/all"); // Try admin route
        const data = Array.isArray(res.data) ? res.data : res.data.tests || [];
        setTests(data);
      } catch (err) {
        // Fallback to student route
        try {
          const res = await api.get("/test/student/all");
          setTests(res.data);
        } catch (e) { console.error("Failed to load tests"); }
      }
    };
    fetchTests();
  }, []);

  // Helper: Paste Dummy Data
  const pasteSample = () => {
    const sample = [
      {
        "question": "What is the capital of France?",
        "options": [
          { "text": "Berlin", "isCorrect": false },
          { "text": "Madrid", "isCorrect": false },
          { "text": "Paris", "isCorrect": true },
          { "text": "Lisbon", "isCorrect": false }
        ]
      },
      {
        "question": "Which planet is known as the Red Planet?",
        "options": [
          { "text": "Earth", "isCorrect": false },
          { "text": "Mars", "isCorrect": true },
          { "text": "Jupiter", "isCorrect": false },
          { "text": "Venus", "isCorrect": false }
        ]
      }
    ];
    setJsonData(JSON.stringify(sample, null, 2));
    setError("");
  };

  const handleUpload = async () => {
    setError("");
    
    if (!selectedTest) {
      setError("⚠️ Please select an exam first.");
      return;
    }
    if (!jsonData.trim()) {
      setError("⚠️ Please paste the JSON data.");
      return;
    }

    setLoading(true);

    try {
      // 1. Validate JSON locally first
      let questions;
      try {
        questions = JSON.parse(jsonData);
      } catch (e) {
        throw new Error("Invalid JSON syntax. Please check your format.");
      }

      if (!Array.isArray(questions)) {
        throw new Error("JSON must be an array of questions [ ... ].");
      }

      // 2. Send to Backend
      const res = await api.post("/test/bulk-upload", {
        testId: selectedTest,
        questions
      });

      setUploadedCount(res.data.count || questions.length);
      setShowSuccessModal(true);
      setJsonData(""); // Clear form
      
    } catch (err) {
      setError(err.message || err.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all bg-gray-50 text-gray-800 placeholder-gray-400";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bulk Upload Questions</h1>
            <p className="text-gray-500 mt-2 text-sm">Import multiple questions at once using JSON format.</p>
          </div>
          <button 
            onClick={pasteSample}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline decoration-indigo-200 hover:decoration-indigo-600 underline-offset-4 transition-all"
          >
            Load Sample JSON
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative">
          <div className="h-2 bg-indigo-600 w-full absolute top-0 left-0"></div>

          <div className="p-6 md:p-8 pt-8">
            
            {/* Error Banner */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* 1. Select Exam */}
            <div className="mb-6">
              <label className={labelClass}>Select Assessment</label>
              <div className="relative">
                <select
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer bg-white`}
                >
                  <option value="">-- Choose a Target Exam --</option>
                  {tests.map(test => (
                    <option key={test._id} value={test._id}>{test.title}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-4 pointer-events-none text-gray-500">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* 2. JSON Editor */}
            <div className="mb-8">
              <label className={labelClass}>Paste JSON Data</label>
              <div className="relative">
                <textarea
                  rows="12"
                  placeholder='[ { "question": "...", "options": [...] } ]'
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all bg-slate-900 text-green-400 font-mono text-sm leading-relaxed"
                />
                <div className="absolute top-2 right-4 text-xs text-slate-500 font-mono">JSON</div>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-right">Ensure the JSON is a valid array of objects.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
               <button
                onClick={handleUpload}
                disabled={loading}
                className={`w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 hover:shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    <span>Upload Questions</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* =========================================
            SUCCESS MODAL
        ========================================= */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 transition-all">
              <div className="bg-green-50 p-6 flex flex-col items-center justify-center border-b border-green-100">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 ring-8 ring-green-50/50">
                   <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Upload Complete!</h3>
              </div>
              
              <div className="p-6 text-center">
                <p className="text-gray-600 mb-6">
                  Successfully imported <span className="font-bold text-indigo-600">{uploadedCount}</span> questions into the selected exam.
                </p>
                <div className="space-y-3">
                  <Link to="/admin/manage-tests">
                    <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition">
                      Go to Manage Tests
                    </button>
                  </Link>
                  <button 
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                  >
                    Upload More
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