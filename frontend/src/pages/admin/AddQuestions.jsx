import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import { FileQuestion, Layers } from "lucide-react";

export default function AddQuestions() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    testId: "",
    question: "",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  // Fetch tests for the dropdown
  useEffect(() => {
    const fetchTests = async () => {
      try {
        // Try admin route first to see all tests (active & inactive)
        const res = await api.get("/test/admin/all");
        const data = Array.isArray(res.data) ? res.data : res.data.tests || [];
        setTests(data);
      } catch (error) {
        // Fallback to student route if admin route isn't set up yet
        try {
          const res = await api.get("/test/student/all");
          setTests(res.data);
        } catch (err) {
          console.error("Failed to load tests");
        }
      }
    };
    fetchTests();
  }, []);

  // Update option text
  const handleOptionTextChange = (index, text) => {
    const newOptions = [...form.options];
    newOptions[index].text = text;
    setForm({ ...form, options: newOptions });
  };

  // Mark specific option as correct (Radio button behavior)
  const markCorrect = (index) => {
    const newOptions = form.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setForm({ ...form, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.testId) {
      alert("Please select a test first.");
      return;
    }
    
    setLoading(true);

    try {
      await api.post("/test/add-question", form);
      setShowSuccessModal(true); // Show success popup
    } catch (error) {
      alert("Failed to add question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset question & options but keep the Test ID selected for faster entry
  const handleAddAnother = () => {
    setForm({
      ...form,
      question: "",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    });
    setShowSuccessModal(false);
  };

  // Styles
  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all bg-gray-50 text-gray-800 placeholder-gray-400";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
<div className="bg-gradient-to-r from-indigo-50 via-white to-white border border-indigo-100 rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    
    {/* Title & Icon */}
    <div className="flex items-start gap-4">
      <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
        <FileQuestion size={24} strokeWidth={2} />
      </div>
      <div>
        <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Add Questions
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 bg-white border border-gray-200 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                <Layers size={12} /> Editor Mode
            </span>
        </div>
        <p className="text-gray-500 mt-2 font-medium text-lg">
          Build your question bank. Add multiple choice, text, or true/false items.
        </p>
      </div>
    </div>
  </div>
</div>

        {/* Card Container */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative">
          
          {/* Decorative Top Border */}
          <div className="h-2 bg-indigo-600 w-full absolute top-0 left-0"></div>

          <div className="p-6 md:p-8 pt-8">
            <form onSubmit={handleSubmit}>
              
              {/* 1. Select Test Dropdown */}
              <div className="mb-6">
                <label className={labelClass}>Select Assessment</label>
                <div className="relative">
                  <select
                    value={form.testId}
                    onChange={(e) => setForm({ ...form, testId: e.target.value })}
                    required
                    className={`${inputClass} appearance-none cursor-pointer bg-white`}
                  >
                    <option value="">-- Choose a Test --</option>
                    {tests.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                  {/* Custom Arrow Icon */}
                  <div className="absolute right-4 top-4 pointer-events-none text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* 2. Question Text */}
              <div className="mb-8">
                <label className={labelClass}>Question Text</label>
                <textarea
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="Type the question here..."
                  required
                  rows="3"
                  className={inputClass}
                />
              </div>

              {/* 3. Options Grid */}
              <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                  <label className={labelClass}>Answer Options</label>
                  <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded">
                    Select the circle to mark correct answer
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {form.options.map((opt, i) => (
                    <div 
                      key={i} 
                      className={`relative flex items-center bg-white rounded-lg border transition-all ${
                        opt.isCorrect 
                          ? 'border-green-500 ring-2 ring-green-100 bg-green-50/30' 
                          : 'border-gray-300 hover:border-indigo-300'
                      }`}
                    >
                      {/* Radio Button for Correct Answer */}
                      <div className="pl-3 pr-2 py-3 flex items-center justify-center border-r border-gray-100">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={opt.isCorrect}
                          onChange={() => markCorrect(i)}
                          className="w-5 h-5 text-green-600 focus:ring-green-500 cursor-pointer border-gray-300"
                          title="Mark as correct answer"
                        />
                      </div>

                      {/* Option Text Input */}
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        required
                        className="w-full px-3 py-3 bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400"
                      />
                      
                      {/* Checkmark Indicator */}
                      {opt.isCorrect && (
                        <div className="absolute right-3 text-green-500 pointer-events-none">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-4 pt-6 border-t border-gray-100">
                <Link to="/admin" className="w-full md:w-auto">
                   <button
                    type="button"
                    className="w-full px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                  >
                    Cancel
                  </button>
                </Link>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full md:w-auto px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 hover:shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span>Save Question</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* =========================================
            SUCCESS MODAL (POPUP)
        ========================================= */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-all">
              
              {/* Header */}
              <div className="bg-green-50 p-6 flex flex-col items-center justify-center border-b border-green-100">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3 ring-4 ring-green-50/50">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Question Added!</h3>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-600 mb-6 text-center text-sm">
                  The question has been successfully saved to the assessment. Do you want to add another one?
                </p>

                <div className="space-y-3">
                  {/* Option 1: Add Another (Primary) */}
                  <button 
                    onClick={handleAddAnother}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Add Another Question
                  </button>

                  {/* Option 2: Done / Go to Dashboard */}
                  <Link to="/admin" className="block w-full">
                    <button className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition">
                      I'm Done, Go Back
                    </button>
                  </Link>
                </div>
              </div>
              
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}