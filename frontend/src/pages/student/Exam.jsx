import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { 
  AlertTriangle, 
  Clock, 
  Menu, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Save,
  Flag,
  RotateCcw,
  CheckCircle,
  Grid // ✅ Ensure this is imported for the menu icon
} from "lucide-react";

export default function Exam() {
  const { testId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- State ---
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [testDetails, setTestDetails] = useState(null);
  
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});       
  const [marked, setMarked] = useState({});         
  const [visited, setVisited] = useState({ 0: true }); 
  const [timeLeft, setTimeLeft] = useState(0);      
  
  // UI State for Mobile Sidebar
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // --- Modal States ---
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false); 
  const [resultModal, setResultModal] = useState(null); 
  const [isTimeUp, setIsTimeUp] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false); 

  // ==============================================================
  // 🛡️ SECURITY & ANTI-CHEATING
  // ==============================================================
  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
      setShowExitWarning(true); 
    };
    const handleBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ""; };
    const handleContextMenu = (e) => e.preventDefault();

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // --- Fetch Data ---
  useEffect(() => {
    if (!testId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const qRes = await api.get(`/test/${testId}/questions`);
        setQuestions(qRes.data);
        const tRes = await api.get(`/test/${testId}`);
        setTestDetails(tRes.data);
        setTimeLeft((tRes.data.duration || 60) * 60);
      } catch (err) {
        console.error("Failed to load exam");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [testId]);

  // --- Timer ---
  useEffect(() => {
    if (loading || timeLeft <= 0 || resultModal) return; 
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, timeLeft, resultModal]);

  // --- Helpers ---
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionIndex) => {
    setAnswers({ ...answers, [current]: optionIndex });
  };

  const handleNavigation = (index) => {
    setVisited({ ...visited, [index]: true });
    setCurrent(index);
    setIsPaletteOpen(false); // ✅ Auto-close sidebar on mobile when navigating
  };

  const handleClearResponse = () => {
    const newAnswers = { ...answers };
    delete newAnswers[current];
    setAnswers(newAnswers);
  };

  const handleMarkForReview = () => {
    setMarked({ ...marked, [current]: true });
    handleNavigation(current < questions.length - 1 ? current + 1 : current);
  };

  const handleSaveAndNext = () => {
    if (marked[current]) {
      const newMarked = { ...marked };
      delete newMarked[current];
      setMarked(newMarked);
    }
    handleNavigation(current < questions.length - 1 ? current + 1 : current);
  };

  const handleInitSubmit = () => {
    setIsSubmitConfirmOpen(true);
    setIsPaletteOpen(false);
  };

  const handleTimeUp = () => {
    setIsTimeUp(true);
    setIsSubmitConfirmOpen(false); 
    finalSubmit(true);
  };

  const finalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        studentId: user._id,
        testId,
        answers: questions.map((q, index) => ({
          questionId: q._id,
          selectedIndex: answers[index],
        })),
      };
      const res = await api.post("/exam/submit", payload);
      setIsSubmitConfirmOpen(false);
      setResultModal(res.data.result); 
    } catch (err) {
      console.error(err);
      alert("Error submitting exam."); 
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Styles ---
  const getStatusClass = (index) => {
    const isAnswered = answers[index] !== undefined;
    const isMarked = marked[index];
    const isVisited = visited[index];

    if (current === index) return "border-2 border-indigo-600 ring-2 ring-indigo-100 bg-white text-indigo-700 font-bold shadow-md transform scale-105"; 
    if (isMarked && isAnswered) return "bg-purple-600 text-white relative"; 
    if (isMarked) return "bg-purple-600 text-white"; 
    if (isAnswered) return "bg-green-600 text-white"; 
    if (isVisited) return "bg-red-50 text-red-600 border border-red-200"; 
    return "bg-gray-100 text-gray-500"; 
  };

  const countAnswered = Object.keys(answers).length;
  const countMarked = Object.keys(marked).length;
  const countNotVisited = questions.length - Object.keys(visited).length;
  const countNotAnswered = Object.keys(visited).length - countAnswered;

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-xl text-indigo-600">Loading Exam...</div>;

  const q = questions[current];
  const isLastQuestion = current === questions.length - 1;

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans relative select-none overflow-hidden">
      
      {/* ================= HEADER ================= */}
      <header className="h-16 bg-indigo-900 text-white flex items-center justify-between px-6 shadow-md z-10">
        <div className="text-xl font-bold tracking-wide flex items-center gap-2">
          
          {/* ✅ Mobile Menu Toggle Button */}
          <button 
            onClick={() => setIsPaletteOpen(true)} 
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Grid size={24} />
          </button>

          <div className="text-sm lg:text-xl font-bold text-gray-100 tracking-wide flex items-center gap-2">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse hidden sm:block"></div>
             <span className="truncate max-w-[150px] sm:max-w-md">{testDetails?.title || "Exam Mode"}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${timeLeft < 300 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
            <Clock size={18} />
            <span className="font-mono text-lg font-bold">{formatTime(timeLeft)}</span>
          </div>
          
        </div>
      </header>

      {/* ================= MAIN BODY ================= */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* --- QUESTION AREA --- */}
        <main className="flex-1 flex flex-col h-full bg-white overflow-y-auto custom-scrollbar">
          
          {/* 1. Question Top Bar (Sticky) */}
          <div className="bg-white/80 backdrop-blur-md px-5 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-20">
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Question {current + 1} <span className="font-normal text-gray-300">/ {questions.length}</span>
              </h2>
              <div className="h-1 w-24 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500 ease-out" 
                  style={{ width: `${((current + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               <span className="text-xs font-bold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                 {q.marks || 1} Mark(s)
               </span>
            </div>
          </div>

          {/* 2. Question Content */}
          <div className="flex-1 max-w-5xl mx-auto w-full p-5 lg:p-10">
            
            {/* Question Text */}
            <div className="mb-8 lg:mb-10">
              <h3 className="text-lg lg:text-2xl font-semibold text-slate-800 leading-relaxed">
                {q.question}
              </h3>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 gap-4">
              {q.options.map((opt, i) => {
                const isSelected = answers[current] === i;
                const optionLabel = String.fromCharCode(65 + i); // Generates A, B, C, D...

                return (
                  <label 
                    key={i} 
                    className={`
                      relative group flex items-start gap-4 p-4 lg:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? "border-indigo-600 bg-indigo-50/40 shadow-md ring-1 ring-indigo-600/20" 
                        : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-gray-50/50 hover:shadow-sm"
                      }
                    `}
                  >
                    {/* Hidden Native Input */}
                    <input 
                      type="radio" 
                      name={`q-${current}`} 
                      className="hidden" 
                      checked={isSelected} 
                      onChange={() => handleOptionSelect(i)} 
                    />

                    {/* Option Label (A, B, C, D) */}
                    <div className={`
                      flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold transition-colors
                      ${isSelected 
                        ? "bg-indigo-600 text-white shadow-sm" 
                        : "bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                      }
                    `}>
                      {optionLabel}
                    </div>

                    {/* Option Text */}
                    <div className="flex-1 pt-2">
                      <span className={`text-base lg:text-lg font-medium transition-colors ${isSelected ? "text-indigo-900" : "text-slate-600"}`}>
                        {opt.text}
                      </span>
                    </div>

                    {/* Checkmark Icon (Visible when selected) */}
                    <div className={`
                      absolute top-5 right-5 transition-all duration-200
                      ${isSelected ? "opacity-100 scale-100" : "opacity-0 scale-75"}
                    `}>
                      <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                        <CheckCircle size={14} className="text-white" />
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigation Bar */}
          <div className="bg-white border-t border-gray-200 p-3 lg:p-4 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
            
            <div className="flex gap-3">

              <button onClick={handleClearResponse} className="px-4 py-2 text-indigo-600 font-medium border border-indigo-600 rounded hover:bg-indigo-50 transition">Clear Response</button>

              <button onClick={handleMarkForReview} className="px-4 py-2 bg-purple-600 text-white font-medium rounded hover:bg-purple-700 transition">Mark for Review</button>

            </div>
            
            <div className="flex w-full sm:w-auto gap-3">
              <button 
                onClick={() => handleNavigation(Math.max(0, current - 1))}
                disabled={current === 0}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm"
              >
                <ChevronLeft size={20} />
              </button>

              {isLastQuestion ? (
                <button 
                  onClick={handleInitSubmit} 
                  className="flex-[2] sm:flex-none px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md shadow-green-200 flex items-center justify-center gap-2 text-sm"
                >
                  Submit Test <CheckCircle size={18} />
                </button>
              ) : (
                <button 
                  onClick={handleSaveAndNext} 
                  className="flex-[2] sm:flex-none px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center justify-center gap-2 text-sm"
                >
                  Save & Next <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </main>

        {/* ================= RESPONSIVE SIDEBAR DRAWER ================= */}
        
        {/* 1. Backdrop for Mobile */}
        {isPaletteOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
            onClick={() => setIsPaletteOpen(false)}
          />
        )}

        {/* 2. Sidebar Container */}
        <aside 
          className={`
            fixed inset-y-0 right-0 z-40 w-[85vw] sm:w-80 bg-white shadow-2xl flex flex-col 
            transform transition-transform duration-300 ease-in-out
            lg:static lg:translate-x-0 lg:shadow-none lg:border-l lg:border-gray-200 lg:w-72 lg:h-full
            ${isPaletteOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Grid size={18} className="text-indigo-600" /> Question Palette
            </h3>
            {/* Close Button (Mobile Only) */}
            <button onClick={() => setIsPaletteOpen(false)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Stats Legend */}
          <div className="p-4 border-b border-gray-100 bg-white">
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-gray-600">
                <div className="flex items-center gap-2"><span className="w-6 h-6 rounded bg-green-600 text-white flex items-center justify-center shadow-sm">{countAnswered}</span> Answered</div>
                <div className="flex items-center gap-2"><span className="w-6 h-6 rounded bg-red-500 text-white flex items-center justify-center shadow-sm">{countNotAnswered}</span> Skipped</div>
                <div className="flex items-center gap-2"><span className="w-6 h-6 rounded bg-gray-200 text-gray-700 flex items-center justify-center border border-gray-300 shadow-sm">{countNotVisited}</span> Fresh</div>
                <div className="flex items-center gap-2"><span className="w-6 h-6 rounded bg-purple-600 text-white flex items-center justify-center shadow-sm">{countMarked}</span> Review</div>
              </div>
          </div>

          {/* Questions Grid */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Navigate</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleNavigation(idx)} 
                    className={`h-9 w-full rounded-lg flex items-center justify-center text-sm font-bold transition-all shadow-sm relative hover:scale-105 active:scale-95 ${getStatusClass(idx)}`}
                  >
                    {idx + 1}
                    {/* Status Dot */}
                    {marked[idx] && answers[idx] !== undefined && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
          </div>

          {/* Sticky Submit Section */}
          <div className="p-5 border-t border-gray-100 bg-white/90 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10 flex-shrink-0">
            <button 
              onClick={handleInitSubmit} 
              className="group relative w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex items-center justify-center gap-2.5 active:scale-[0.98]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
              <Save size={20} className="transition-transform group-hover:scale-110" />
              <span className="tracking-wide">Submit Exam</span>
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-2.5 font-medium">
              Finish and lock your answers
            </p>
          </div>

        </aside>
      </div>

      {/* ================= MODALS ================= */}
      
      {/* Exit Warning Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-red-900/90 backdrop-blur-md p-4 animate-in zoom-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center border-b-4 border-red-600">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
               <AlertTriangle size={32} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Action Blocked!</h2>
            <p className="text-gray-600 text-sm mb-6">
               Going back is not allowed. Please submit your exam to finish.
            </p>
            <button onClick={() => setShowExitWarning(false)} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl">
              Return to Exam
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {isSubmitConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="bg-indigo-600 p-4 text-white font-bold flex justify-between">
              <span>Exam Summary</span>
              <button onClick={() => setIsSubmitConfirmOpen(false)}><X size={20}/></button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6 text-center">Are you sure you want to submit?</p>
              <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                <div className="bg-green-50 p-3 rounded-lg border border-green-100"><div className="text-2xl font-bold text-green-600">{countAnswered}</div><div className="text-xs text-green-700 uppercase font-bold">Answered</div></div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-100"><div className="text-2xl font-bold text-red-500">{countNotAnswered}</div><div className="text-xs text-red-700 uppercase font-bold">Unanswered</div></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsSubmitConfirmOpen(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-700">Cancel</button>
                <button onClick={() => finalSubmit(false)} disabled={isSubmitting} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">
                  {isSubmitting ? "Submitting..." : "Yes, Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Score Modal */}
      {resultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/95 backdrop-blur-sm p-4 animate-in zoom-in">
          <div className="bg-white rounded-3xl w-full max-w-sm text-center p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <span className="text-4xl">🏆</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Test Completed!</h2>
            <p className="text-gray-500 text-sm mb-6">
               {isTimeUp ? "Time's up! Auto-submitted." : "Successfully submitted."}
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
               <p className="text-xs text-gray-400 uppercase font-bold mb-1">Your Score</p>
               <div className="text-5xl font-black text-indigo-600">{resultModal.score}</div>
            </div>
            <button onClick={() => navigate("/student/results")} className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">
              View Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}