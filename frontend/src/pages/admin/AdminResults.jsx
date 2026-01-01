import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch data
    api.get("/exam/admin/results")
      .then((res) => {
        setResults(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch results", err);
        setLoading(false);
      });
  }, []);

  // Filter logic for search
  const filteredResults = results.filter((r) => 
    r.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.testId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Student Results</h1>
            <p className="text-gray-500 text-sm mt-1">Monitor student performance and exam outcomes</p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search student or test..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full md:w-64 transition-shadow"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-64 text-indigo-600">
              <svg className="animate-spin h-8 w-8 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm font-medium">Loading results...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredResults.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <span className="text-5xl mb-4">📋</span>
              <p>No results found.</p>
            </div>
          )}

          {/* Data Table */}
          {!loading && filteredResults.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Test Title</th>
                    <th className="px-6 py-4 text-center">Score obtained</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Date Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredResults.map((r) => {
                    // Logic to determine Pass/Fail
                    const isPassed = r.score >= r.testId?.passingMarks;
                    
                    return (
                      <tr key={r._id} className="hover:bg-indigo-50/30 transition-colors">
                        {/* Student Column */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800">{r.studentId?.name || "Unknown"}</span>
                            <span className="text-xs text-gray-500">{r.studentId?.email}</span>
                          </div>
                        </td>

                        {/* Test Title */}
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          {r.testId?.title || "Deleted Test"}
                        </td>

                        {/* Score */}
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg font-bold text-gray-800">{r.score}</span>
                          <span className="text-xs text-gray-400 ml-1">/ {r.testId?.totalMarks}</span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                            isPassed 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isPassed ? "bg-green-500" : "bg-red-500"}`}></span>
                            {isPassed ? "Passed" : "Failed"}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-right text-sm text-gray-500">
                          {new Date(r.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                          <div className="text-xs text-gray-400">
                            {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}