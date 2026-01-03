import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import StudentLayout from "../../layouts/StudentLayout";
import { 
  CheckCircle, 
  XCircle, 
  MinusCircle, 
  ArrowLeft, 
  Trophy, 
  Target,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  BarChart2,
  List,
  Clock
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

export default function ResultAnalysis() {
  const { resultId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); 
  const [activeTab, setActiveTab] = useState("overview"); // For Mobile: 'overview' or 'questions'
  const [expandedQuestion, setExpandedQuestion] = useState(null); // Accordion state

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await api.get(`/exam/result/${resultId}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load analysis", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [resultId]);

  // --- DERIVED STATE ---
  const stats = useMemo(() => {
    if (!data) return null;
    const { testId: test, answers = [], score, correctAnswers, wrongAnswers } = data;
    const totalQuestions = test?.totalQuestions || answers.length || 0;
    const skipped = answers.length > 0 
      ? answers.filter(a => a.selectedIndex === -1 || a.selectedIndex === null).length 
      : (totalQuestions - (correctAnswers + wrongAnswers));
    const percentage = test?.totalMarks ? Math.round((score / test.totalMarks) * 100) : 0;
    
    return { test, score, correctAnswers, wrongAnswers, skipped, percentage, totalQuestions };
  }, [data]);

  const filteredAnswers = useMemo(() => {
    if (!data?.answers) return [];
    return data.answers.filter((ans) => {
      const q = ans.questionId;
      if (!q) return false; 

      let correctChoice = q.correctOptionIndex;
      if (correctChoice === undefined && q.options) {
        correctChoice = q.options.findIndex(o => o.isCorrect === true);
      }
      const userChoice = ans.selectedIndex;
      const isSkipped = userChoice === null || userChoice === undefined || userChoice === -1;
      const isCorrect = userChoice === correctChoice;

      if (filter === "correct") return isCorrect;
      if (filter === "incorrect") return !isCorrect && !isSkipped;
      if (filter === "skipped") return isSkipped;
      return true; 
    });
  }, [data, filter]);

  // --- LOADING STATE ---
  if (loading) return (
    <StudentLayout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium animate-pulse">Analyzing performance...</p>
      </div>
    </StudentLayout>
  );

  // --- ERROR / EMPTY STATE ---
  if (!data || !stats) return (
    <StudentLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-gray-50 p-6 rounded-full mb-4">
          <AlertTriangle className="text-gray-400" size={40} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Analysis Not Available</h2>
        <p className="text-gray-500 mt-2 mb-6 max-w-md">We couldn't retrieve the details for this exam. It might have been removed or created with an older version.</p>
        <Link to="/student/results">
          <button className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">Go Back</button>
        </Link>
      </div>
    </StudentLayout>
  );

  const { test, score, correctAnswers, wrongAnswers, skipped, percentage } = stats;
  
  // Check for legacy data
  if (!data.answers || data.answers.length === 0) {
    return (
       <StudentLayout>
        <div className="max-w-2xl mx-auto mt-20 p-8 bg-amber-50 border border-amber-200 rounded-2xl text-center">
          <AlertTriangle size={40} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-amber-900 mb-2">Detailed Analysis Unavailable</h2>
          <p className="text-amber-800 mb-6">This record does not contain detailed question data.</p>
          <Link to="/student">
            <button className="px-6 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition">Return Home</button>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const chartData = [
    { name: "Correct", value: correctAnswers, color: "#10b981" }, 
    { name: "Incorrect", value: wrongAnswers, color: "#ef4444" }, 
    { name: "Skipped", value: skipped, color: "#94a3b8" }, 
  ];

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gray-50/50 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* === HEADER === */}
          <div className="pt-2 pb-4">
            <Link to="/student/results" className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors mb-4 text-sm font-medium">
              <ArrowLeft size={16} /> Back to History
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{test?.title || "Exam Analysis"}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                    percentage >= (test?.passingMarks/test?.totalMarks)*100 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {percentage >= (test?.passingMarks/test?.totalMarks)*100 ? "Passed" : "Failed"}
                  </span>
                </div>
                <p className="text-gray-500 flex items-center gap-2 text-sm">
                  <Clock size={14} /> Completed on {new Date(data.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Mobile Tabs */}
              <div className="flex md:hidden bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-full">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500'}`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab('questions')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'questions' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500'}`}
                >
                  Questions
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* === SIDEBAR (STATS) - Sticky on Desktop === */}
            <div className={`lg:col-span-4 lg:sticky lg:top-8 space-y-6 ${activeTab === 'questions' ? 'hidden lg:block' : 'block'}`}>
              
              {/* Score Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <div className="p-6 text-center">
                   <div className="relative inline-block mb-4">
                     <div className="w-32 h-32 rounded-full border-8 border-indigo-50 flex items-center justify-center">
                       <span className="text-4xl font-black text-gray-900">{score}</span>
                     </div>
                     <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                       Total Marks: {test?.totalMarks}
                     </div>
                   </div>
                   
                   <p className="text-gray-500 font-medium mb-6">You scored <span className="text-gray-900 font-bold">{percentage}%</span> on this assessment.</p>
                   
                   <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-6">
                      <div className="text-center">
                        <span className="block text-2xl font-bold text-emerald-600">{correctAnswers}</span>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Correct</span>
                      </div>
                      <div className="text-center border-l border-r border-gray-100">
                        <span className="block text-2xl font-bold text-red-500">{wrongAnswers}</span>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Wrong</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-2xl font-bold text-gray-500">{skipped}</span>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Skipped</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Chart Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest w-full text-left mb-4">Distribution</h3>
                <div className="w-full h-[250px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        cornerRadius={4}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 600, color: '#374151' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                     <span className="text-3xl font-bold text-gray-300 opacity-20"><BarChart2 size={48}/></span>
                  </div>
                </div>
              </div>
            </div>

            {/* === MAIN CONTENT (QUESTIONS) === */}
            <div className={`lg:col-span-8 ${activeTab === 'overview' ? 'hidden lg:block' : 'block'}`}>
              
              {/* Filter Tabs */}
              <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm mb-6 flex overflow-x-auto no-scrollbar gap-2 sticky top-0 z-10 lg:static">
                {[
                  { id: 'all', label: 'All Questions', icon: List },
                  { id: 'correct', label: 'Correct', icon: CheckCircle },
                  { id: 'incorrect', label: 'Incorrect', icon: XCircle },
                  { id: 'skipped', label: 'Skipped', icon: MinusCircle }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                      filter === f.id 
                        ? "bg-gray-900 text-white shadow-md" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <f.icon size={16} className={filter === f.id ? "text-indigo-400" : ""} />
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {filteredAnswers.length === 0 && (
                   <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                     <p className="text-gray-400">No questions found in this category.</p>
                   </div>
                )}

                {filteredAnswers.map((item, index) => {
                  const q = item.questionId; 
                  if (!q) return null;
                  const userChoice = item.selectedIndex;
                  
                  let correctChoice = q.correctOptionIndex;
                  if (correctChoice === undefined && q.options) {
                      correctChoice = q.options.findIndex(o => o.isCorrect === true);
                  }

                  const isSkipped = userChoice === null || userChoice === undefined || userChoice === -1;
                  const isCorrect = userChoice === correctChoice;
                  const isWrong = !isSkipped && !isCorrect;
                  const isExpanded = expandedQuestion === index;

                  return (
                    <div 
                      key={index} 
                      className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
                        isExpanded ? 'shadow-md ring-1 ring-indigo-500 border-indigo-500' : 'shadow-sm border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {/* Question Header (Always Visible) */}
                      <div 
                        className="p-5 cursor-pointer flex gap-4"
                        onClick={() => setExpandedQuestion(isExpanded ? null : index)}
                      >
                         <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                           isCorrect ? 'bg-emerald-100 text-emerald-700' : isWrong ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                         }`}>
                           {isCorrect ? <CheckCircle size={20} /> : isWrong ? <XCircle size={20} /> : <MinusCircle size={20} />}
                         </div>

                         <div className="flex-1">
                            <div className="flex justify-between items-start">
                               <h3 className="text-gray-900 font-semibold text-base md:text-lg leading-snug pr-8">
                                 {q.question}
                               </h3>
                               <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                                 {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                               </button>
                            </div>
                            
                            {!isExpanded && (
                               <div className="mt-2 text-xs font-medium text-gray-500 flex items-center gap-2">
                                  <span>Correct Answer: <span className="font-bold text-gray-700">{String.fromCharCode(65 + correctChoice)}</span></span>
                                  {isWrong && <span className="text-red-500">• Your Answer: <span className="font-bold">{String.fromCharCode(65 + userChoice)}</span></span>}
                               </div>
                            )}
                         </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-5 pb-6 pt-0 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="h-px w-full bg-gray-100 mb-4"></div>
                          <div className="space-y-3">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = userChoice === optIdx;
                              const isAnswer = correctChoice === optIdx;

                              let styles = "border-gray-200 hover:bg-gray-50";
                              if (isAnswer) styles = "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500";
                              else if (isSelected && !isAnswer) styles = "bg-red-50 border-red-500 ring-1 ring-red-500";

                              return (
                                <div key={optIdx} className={`flex items-center p-3 rounded-lg border text-sm ${styles}`}>
                                  <span className={`w-6 h-6 flex items-center justify-center rounded-full border mr-3 text-xs font-bold ${
                                    isAnswer ? "bg-emerald-600 border-emerald-600 text-white" : 
                                    isSelected ? "bg-red-500 border-red-500 text-white" : "border-gray-300 text-gray-400"
                                  }`}>
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span className={`flex-1 ${isAnswer ? "font-bold text-emerald-900" : isSelected ? "font-medium text-red-900" : "text-gray-600"}`}>
                                    {opt.text}
                                  </span>
                                  {isAnswer && <CheckCircle size={16} className="text-emerald-600" />}
                                  {isSelected && !isAnswer && <XCircle size={16} className="text-red-600" />}
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation Box (If available in API) */}
                          {q.explanation && (
                            <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 block">Explanation</span>
                              <p className="text-sm text-indigo-900 leading-relaxed">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}