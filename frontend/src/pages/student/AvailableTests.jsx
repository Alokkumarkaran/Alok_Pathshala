import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import StudentLayout from "../../layouts/StudentLayout";
import { 
  Search, 
  Filter, 
  Clock, 
  Award, 
  ChevronRight, 
  BookOpen, 
  BarChart 
} from "lucide-react";

export default function AvailableTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const res = await api.get("/test/student/all");
        setTests(res.data);
      } catch (error) {
        console.error("Failed to load tests", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  // Filter tests based on search
  const filteredTests = tests.filter((test) =>
    test.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to determine difficulty color/label based on passing marks (simulation)
  const getDifficulty = (passingMarks, totalMarks) => {
    const ratio = passingMarks / totalMarks;
    if (ratio >= 0.5) return { label: "Hard", color: "text-red-600 bg-red-50 border-red-100" };
    if (ratio >= 0.35) return { label: "Medium", color: "text-yellow-600 bg-yellow-50 border-yellow-100" };
    return { label: "Easy", color: "text-green-600 bg-green-50 border-green-100" };
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* === HEADER SECTION === */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Available Assessments</h1>
            <p className="text-gray-500 mt-2">Explore and attempt exams to test your knowledge.</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm hover:border-gray-300"
            />
          </div>
        </div>

        {/* === CONTENT GRID === */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Filter size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Assessments Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              We couldn't find any tests matching "{searchTerm}". Try adjusting your search keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredTests.map((test) => {
              const difficulty = getDifficulty(test.passingMarks, test.totalMarks);
              
              return (
                <div
                  key={test._id}
                  className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden"
                >
                  {/* Card Header with Color Strip */}
                  <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:from-indigo-600 group-hover:to-purple-600 transition-colors"></div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    
                    {/* Top Row: Icon & Difficulty */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <BookOpen size={24} />
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border uppercase tracking-wide ${difficulty.color}`}>
                        {difficulty.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {test.title}
                    </h3>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-500 mb-6 mt-auto pt-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span>{test.duration} mins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-gray-400" />
                        <span>{test.totalMarks} Marks</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <BarChart size={16} className="text-gray-400" />
                        <span>Passing Score: <span className="font-semibold text-gray-700">{test.passingMarks}</span></span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link to={`/student/exam/${test._id}`} className="mt-auto">
                      <button className="w-full py-3 bg-white border-2 border-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center justify-center gap-2 group/btn">
                        Start Assessment
                        <ChevronRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    </Link>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}