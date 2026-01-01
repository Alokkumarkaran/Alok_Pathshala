import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";

export default function CreateTest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTest, setCreatedTest] = useState(null); // Store created test info for the modal
  
  const [form, setForm] = useState({
    title: "",
    duration: "",
    totalMarks: "",
    passingMarks: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/test/create", form);
      
      // Save response to show in modal
      setCreatedTest(res.data);
      setShowSuccessModal(true);
      
      // Reset form
      setForm({
        title: "",
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

  // Styles
  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all bg-gray-50 text-gray-800 placeholder-gray-400";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Assessment</h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">Configure the details for a new student examination.</p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative">
          
          {/* Decorative Top Border */}
          <div className="h-2 bg-indigo-600 w-full absolute top-0 left-0"></div>

          <div className="p-6 md:p-8 pt-8">
            <form onSubmit={handleSubmit}>
              
              {/* Test Title */}
              <div className="mb-6">
                <label className={labelClass}>Exam Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Mathematics Final Semester 1"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* Grid for Numeric Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* Duration */}
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

                {/* Total Marks */}
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

                {/* Passing Marks */}
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
                  onClick={() => setForm({ title: "", duration: "", totalMarks: "", passingMarks: "" })}
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
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>Create Test</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
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
              
              {/* Success Icon Header */}
              <div className="bg-green-50 p-6 flex flex-col items-center justify-center border-b border-green-100">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 ring-8 ring-green-50">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Test Created Successfully!</h3>
                <p className="text-sm text-gray-500 mt-1 text-center">
                  "{createdTest?.title}" has been added to the system.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="p-6">
                <p className="text-gray-600 mb-6 text-center text-sm">
                  What would you like to do next?
                </p>

                <div className="space-y-3">
                  {/* Option 1: Add Questions (Primary) */}
                  <Link to="/admin/add-question">
                    <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition transform active:scale-95 flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      Add Questions Now
                    </button>
                  </Link>

                  {/* Option 2: Close / Create Another (Secondary) */}
                  <button 
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                  >
                    Create Another Test
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