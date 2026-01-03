import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  
  // ✅ NEW: State for Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("You must agree to the terms and conditions.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", {
        ...form,
        role: "student",
      });
      // ✅ Show Success Modal instead of immediate redirect
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-blue-600 relative overflow-x-hidden">

  {/* =========================================
      REGISTRATION PANEL (Mobile + Desktop)
  ========================================= */}
  <div className="w-full lg:w-1/2 flex flex-col justify-center items-center text-white p-10 lg:p-12 relative overflow-hidden min-h-[35vh] lg:min-h-screen">

    {/* Background Decor */}
    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
      <div className="absolute top-[-20%] left-[-20%] w-80 h-80 bg-white rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-80 h-80 bg-indigo-400 rounded-full blur-3xl"></div>
    </div>

    <div className="relative z-10 text-center">
      {/* Icon */}
      <div className="bg-white w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg transform hover:scale-110 transition-transform duration-300">
        <svg className="w-8 h-8 lg:w-10 lg:h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a1 1 0 00.424.828L10 18.86l4.576-3.81a1 1 0 00.424-.828v-4.102l1.69-.724a1 1 0 00-.69-1.832l-7-3a1 1 0 00-.787 0l-7 3a1 1 0 00-.69 1.832 1 1 0 00.788.103z" />
        </svg>
      </div>

      {/* Header */}
      <h1 className="text-2xl lg:text-4xl font-bold mb-3 lg:mb-4">
        Join Alok Pathshala 🎓
      </h1>

      {/* Subtext */}
      <p className="text-white/90 text-sm lg:text-lg max-w-sm lg:max-w-md mx-auto leading-relaxed font-medium">
        Create your account today to Unlock your full potential with practice assessments, and real-time tracking.The first step to your new future takes less than a minute.
      </p>
    </div>
  </div>

      {/* Form - Right Panel / Mobile View */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none mt-auto lg:mt-0 shadow-2xl relative z-0">
        <div className="w-full max-w-md">
          
          {/* Registration Header (Centered for Desktop + Mobile) */}
<div className="flex flex-col items-center justify-center pt-8 pb-8 text-center w-full">
  <span className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full 
                   text-xs font-semibold tracking-wider uppercase 
                   bg-green-50 text-green-600">
    Create Your Account
  </span>

  
</div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 text-sm p-4 rounded-lg flex items-center gap-3 border border-red-100 animate-pulse">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="peer w-full pl-10 pr-4 py-3 border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 placeholder-transparent bg-transparent"
                placeholder="Name"
                required
              />
              <label
                htmlFor="name"
                className="absolute left-10 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-blue-600 peer-focus:text-sm"
              >
                Full Name
              </label>
              <User className="absolute left-3 top-3.5 text-gray-400 peer-focus:text-blue-600 transition-colors" size={20} />
            </div>

            {/* Email Input */}
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="peer w-full pl-10 pr-4 py-3 border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 placeholder-transparent bg-transparent"
                placeholder="Email Address"
                required
              />
              <label
                htmlFor="email"
                className="absolute left-10 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-blue-600 peer-focus:text-sm"
              >
                Email Address
              </label>
              <Mail className="absolute left-3 top-3.5 text-gray-400 peer-focus:text-blue-600 transition-colors" size={20} />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="peer w-full pl-10 pr-12 py-3 border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 placeholder-transparent bg-transparent"
                placeholder="Password"
                required
              />
              <label
                htmlFor="password"
                className="absolute left-10 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-blue-600 peer-focus:text-sm"
              >
                Password
              </label>
              <Lock className="absolute left-3 top-3.5 text-gray-400 peer-focus:text-blue-600 transition-colors" size={20} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 select-none cursor-pointer">
                By signing up, I agree with{" "}
                <a href="#" className="text-blue-600 hover:underline font-semibold">
                  Terms & Conditions
                </a>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col lg:flex-row gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-bold shadow-lg shadow-blue-200 transition-all transform active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
              <Link to="/login" className="w-full">
                <button
                  type="button"
                  className="w-full bg-white hover:bg-gray-50 text-blue-600 py-3 rounded-full font-bold border-2 border-blue-600 shadow-sm transition-all transform active:scale-95"
                >
                  Sign In
                </button>
              </Link>
            </div>
            {/* Auth Footer */}
<footer className="
  mt-8 lg:mt-12
  w-full
  text-center
  text-xs sm:text-sm
  text-gray-500
">
  <p className="font-medium">
    Learn. Practice. Succeed. 🎓
  </p>

  <p className="mt-1">
    © {new Date().getFullYear()}{" "}
    <span className="font-semibold text-gray-700">
      Alok Pathshala
    </span>
  </p>
</footer>
          </form>
        </div>
      </div>

      {/* =========================================
          ✅ SUCCESS POPUP MODAL
      ========================================= */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative text-center p-8 transform scale-100 transition-all">
            
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50 animate-bounce">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-500 text-sm mb-8 px-4">
              Welcome, <span className="font-semibold text-blue-600">{form.name}</span>! Your registration was successful. You can now log in to explore the platform.
            </p>

            <button 
              onClick={() => navigate("/login")}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Continue to Login</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}