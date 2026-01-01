import { useEffect, useState } from "react";
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
  PieChart as PieIcon 
} from "lucide-react";
// ✅ Import Recharts components
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

export default function ResultAnalysis() {
  const { resultId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); 

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

  if (loading) return (
    <StudentLayout>
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading analysis...</p>
      </div>
    </StudentLayout>
  );

  if (!data) return (
    <StudentLayout>
      <div className="text-center p-12 text-gray-500">Analysis not found.</div>
    </StudentLayout>
  );

  const { testId: test, answers = [], score, correctAnswers, wrongAnswers } = data;
  
  // Stats Calculation
  const totalQuestions = test?.totalQuestions || answers.length || 0;
  const skipped = answers.length > 0 
    ? answers.filter(a => a.selectedIndex === -1 || a.selectedIndex === null).length 
    : (totalQuestions - (correctAnswers + wrongAnswers));

  const percentage = test?.totalMarks ? Math.round((score / test.totalMarks) * 100) : 0;

  // ✅ PREPARE CHART DATA
  const chartData = [
    { name: "Correct", value: correctAnswers, color: "#22c55e" }, // Green
    { name: "Incorrect", value: wrongAnswers, color: "#ef4444" }, // Red
    { name: "Skipped", value: skipped, color: "#9ca3af" },       // Gray
  ];

  // 🔴 CHECK FOR OLD DATA
  if (!answers || answers.length === 0) {
    return (
      <StudentLayout>
        <div className="max-w-4xl mx-auto mt-10 p-8 bg-yellow-50 border border-yellow-200 rounded-2xl text-center">
          <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-yellow-800 mb-2">Detailed Analysis Unavailable</h2>
          <p className="text-yellow-700 mb-6">
            This exam was taken before the system update.
          </p>
          <Link to="/student">
            <button className="px-6 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 transition">
              Take a New Exam
            </button>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  // Filter Logic
  const filteredAnswers = answers.filter((ans) => {
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

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto px-4 pb-12">
        
        {/* === HEADER === */}
        <div className="mb-8 mt-6">
          <Link to="/student/results" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-4 text-sm font-medium">
            <ArrowLeft size={16} /> Back to Results
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{test?.title || "Exam Analysis"}</h1>
              <p className="text-gray-500 mt-1">Detailed breakdown of your performance</p>
            </div>
            
            <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm">
              <Trophy size={24} className="text-yellow-500" />
              <div className="flex flex-col">
                 <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Your Score</span>
                 <span className="text-xl font-black text-indigo-900 leading-none">
                   {score} <span className="text-sm font-medium text-gray-400">/ {test?.totalMarks}</span>
                 </span>
              </div>
            </div>
          </div>
        </div>

        {/* === 📊 VISUALIZATION SECTION === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* LEFT: DONUT CHART */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <PieIcon size={20} className="text-indigo-600" /> Overview
            </h3>
            <div className="w-full h-[220px]">
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
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RIGHT: STATS CARDS (Grid 2x2) */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
             {/* Accuracy */}
             <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center group hover:shadow-md transition-all">
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                 <Target size={24} />
               </div>
               <span className="text-3xl font-black text-gray-800">{percentage}%</span>
               <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">Accuracy</span>
             </div>
             
             {/* Correct */}
             <div className="bg-green-50 p-5 rounded-2xl border border-green-100 flex flex-col items-center justify-center text-center">
               <span className="text-3xl font-black text-green-600">{correctAnswers}</span>
               <span className="text-xs text-green-700 uppercase font-bold tracking-widest flex items-center gap-1">
                  <CheckCircle size={12} /> Correct
               </span>
             </div>

             {/* Incorrect */}
             <div className="bg-red-50 p-5 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center">
               <span className="text-3xl font-black text-red-600">{wrongAnswers}</span>
               <span className="text-xs text-red-700 uppercase font-bold tracking-widest flex items-center gap-1">
                  <XCircle size={12} /> Wrong
               </span>
             </div>

             {/* Skipped */}
             <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center">
               <span className="text-3xl font-black text-gray-600">{skipped}</span>
               <span className="text-xs text-gray-500 uppercase font-bold tracking-widest flex items-center gap-1">
                  <MinusCircle size={12} /> Skipped
               </span>
             </div>
          </div>
        </div>

        {/* === FILTER TABS === */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
          {['all', 'correct', 'incorrect', 'skipped'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-all border ${
                filter === f 
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200" 
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f} Questions
            </button>
          ))}
        </div>

        {/* === QUESTIONS LIST === */}
        <div className="space-y-6">
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

            return (
              <div 
                key={index} 
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                  isCorrect ? "border-green-200" : isWrong ? "border-red-200" : "border-gray-200"
                }`}
              >
                <div className="p-6">
                  {/* Question Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 font-bold text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-gray-900 font-semibold text-lg leading-relaxed">
                        {q.question}
                      </h3>
                    </div>
                    
                    {/* Badge */}
                    <div className="flex-shrink-0">
                      {isCorrect && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide"><CheckCircle size={14} /> Correct</span>}
                      {isWrong && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wide"><XCircle size={14} /> Wrong</span>}
                      {isSkipped && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wide"><MinusCircle size={14} /> Skipped</span>}
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="space-y-3 pl-0 md:pl-12">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userChoice === optIdx;
                      const isAnswer = correctChoice === optIdx;

                      // Dynamic Styles
                      let containerClass = "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"; 
                      let icon = null;
                      let label = null;

                      if (isAnswer) {
                        containerClass = "border-green-500 bg-green-50/60 text-green-900 ring-1 ring-green-500 font-medium";
                        icon = <CheckCircle size={18} className="text-green-600" />;
                        label = <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-green-600 text-white tracking-wide shadow-sm">Correct Answer</span>;
                      } 
                      
                      if (isSelected) {
                        if (isAnswer) {
                           label = (
                             <div className="flex gap-2">
                               <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-800 text-white tracking-wide shadow-sm">Your Answer</span>
                               <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-green-600 text-white tracking-wide shadow-sm">Correct</span>
                             </div>
                           );
                        } else {
                           containerClass = "border-red-500 bg-red-50/60 text-red-900 ring-1 ring-red-500 font-medium";
                           icon = <XCircle size={18} className="text-red-600" />;
                           label = <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-600 text-white tracking-wide shadow-sm">Your Answer</span>;
                        }
                      }

                      return (
                        <div 
                          key={optIdx} 
                          className={`relative flex items-center justify-between p-3.5 rounded-xl border transition-all ${containerClass}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${isAnswer || isSelected ? 'border-current opacity-100' : 'border-gray-300 opacity-50'}`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                             {label}
                             {icon}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </StudentLayout>
  );
}