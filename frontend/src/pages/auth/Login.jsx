import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Using standard router navigation
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      // 🔑 Store Token & User Data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redirect based on role
      if (res.data.user.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/student";
      }

    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-blue-600 relative overflow-x-hidden">
      
      {/* =========================================
          WELCOME PANEL (Visible on Mobile & Desktop)
      ========================================= */}
      {/* ✅ CHANGED: Removed 'hidden', added w-full for mobile */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center text-white p-10 lg:p-12 relative overflow-hidden min-h-[35vh] lg:min-h-screen">
        
        {/* Background Decor (Optional) */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-[-20%] left-[-20%] w-80 h-80 bg-white rounded-full blur-3xl"></div>
           <div className="absolute bottom-[-20%] right-[-20%] w-80 h-80 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center">
  <div className="bg-white w-32 h-32 lg:w-60 lg:h-60 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg transform hover:scale-110 transition-transform duration-300 overflow-hidden">
    <img 
      src="/Alok_Pathshala_logo.png" 
      alt="Logo" 
      className="w-full h-full object-cover" 
    />
  </div>
          
          <h1 className="text-2xl lg:text-4xl font-bold mb-3 lg:mb-4">
            Welcome Back! 🎓
          </h1>

          <p className="text-white/90 text-sm lg:text-lg max-w-sm lg:max-w-md mx-auto leading-relaxed font-medium">
            Sign in to continue your learning journey, explore new assessments, and track your performance.
          </p>
        </div>
      </div>

      {/* =========================================
          RIGHT PANEL (Form Area)
      ========================================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none mt-auto lg:mt-0 shadow-2xl relative z-0">
        <div className="w-full max-w-md">
          
{/* Login Header (Centered for Desktop + Mobile) */}
<div className="flex flex-col items-center justify-center pt-8 pb-8 text-center w-full">
  <span className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full 
                   text-xs font-semibold tracking-wider uppercase 
                   bg-blue-50 text-blue-600">
    🔐 Login Here
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

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Input */}
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <div className="text-center mt-6">
              <p className="text-gray-500">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 font-bold hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>

            

            {/* Action Buttons */}
            <div className="pt-2">
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
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
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
    </div>
  );
}