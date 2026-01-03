import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import api from "../api/axios"; 
import { 
  LayoutDashboard, 
  FileText, 
  BarChart2, 
  Award, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search, 
  User, 
  Clock,
  BookOpen,
  AlertTriangle,
  Trash2,
  CheckCheck, // <--- Add this
  Inbox
} from "lucide-react";

export default function StudentLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // --- UI States ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // --- Notification State ---
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [pollErrorCount, setPollErrorCount] = useState(0); // Circuit breaker

  // --- HELPER: Format Time ---
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // --- LOGIC: Fetch & Process Notifications ---
  const fetchNotifications = async () => {
    // CIRCUIT BREAKER: If we failed 3 times in a row, stop polling to save the server
    if (pollErrorCount >= 3) return;

    try {
      if (notifications.length === 0) setLoadingNotifs(true);
      
      // ✅ FIX: Changed from "/test/available" to "/test/student/all"
      const res = await api.get("/test/student/all");
      
      // Reset error count on success
      setPollErrorCount(0);

      // 1. Sort by Newest First
      const sortedTests = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // 2. Get Read History from LocalStorage
      const readIds = JSON.parse(localStorage.getItem("read_notifications") || "[]");
      const deletedIds = JSON.parse(localStorage.getItem("deleted_notifications") || "[]");

      // 3. Transform Data
      const newNotifs = sortedTests
        .filter(test => !deletedIds.includes(test._id))
        .slice(0, 5) 
        .map((test) => ({
          id: test._id,
          title: "New Assessment Added",
          desc: test.title,
          rawTime: test.createdAt,
          time: timeAgo(test.createdAt),
          read: readIds.includes(test._id)
        }));

      setNotifications(newNotifs);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      // Increment error count
      setPollErrorCount(prev => prev + 1);
    } finally {
      setLoadingNotifs(false);
    }
  };

  // --- EFFECT: Initial Fetch + Polling (Every 30s) ---
  useEffect(() => {
    fetchNotifications(); 

    const intervalId = setInterval(() => {
      fetchNotifications(); 
    }, 30000);

    return () => clearInterval(intervalId); 
  }, [pollErrorCount]); // Add dependency to stop polling if errors occur

  const unreadCount = notifications.filter(n => !n.read).length;

  // --- ACTION: Mark as Read ---
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    const readIds = JSON.parse(localStorage.getItem("read_notifications") || "[]");
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem("read_notifications", JSON.stringify(readIds));
    }
  };

  // --- ACTION: Delete Notification ---
  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    const deletedIds = JSON.parse(localStorage.getItem("deleted_notifications") || "[]");
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem("deleted_notifications", JSON.stringify(deletedIds));
    }
  };

  // --- ACTION: Clear All ---
  const clearAllNotifications = () => {
    const idsToDelete = notifications.map(n => n.id);
    const deletedIds = JSON.parse(localStorage.getItem("deleted_notifications") || "[]");
    const updatedDeleted = [...new Set([...deletedIds, ...idsToDelete])];
    
    localStorage.setItem("deleted_notifications", JSON.stringify(updatedDeleted));
    setNotifications([]);
  };

  // --- UI Handlers ---
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const isActive = (path) => location.pathname === path;

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const NavLink = ({ to, icon, label }) => (
    <Link
      to={to}
      onClick={() => setIsSidebarOpen(false)}
      className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden font-medium text-[15px] ${
        isActive(to)
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <span className={`relative z-10 transition-transform duration-300 ${isActive(to) ? "scale-110" : "group-hover:scale-110"}`}>
        {icon}
      </span>
      <span className="relative z-10">{label}</span>
      {isActive(to) && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20"></div>}
    </Link>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-800">
      
      {/* ================= SIDEBAR ================= */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-slate-200 shadow-2xl lg:shadow-none transform transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">A</div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">Alok Pathshala</h1>
              <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest">Student Portal</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden ml-auto text-slate-400"><X size={24} /></button>
        </div>

        <div className="flex-1 px-5 py-8 overflow-y-auto custom-scrollbar space-y-1">
          <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
          <NavLink to="/student" label="Dashboard" icon={<LayoutDashboard size={20} />} />
          <NavLink to="/student/all-tests" label="Assessments" icon={<FileText size={20} />} />
          <NavLink to="/student/results" label="Analytics" icon={<BarChart2 size={20} />} />
          <NavLink to="/student/sleaderboard" label="Leaderboard" icon={<Award size={20} />} />
        </div>

        <div className="p-5 border-t border-slate-50">
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* --- TOP NAVBAR --- */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-10 z-30 sticky top-0">
          
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl lg:hidden transition-colors">
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center w-full max-w-md bg-slate-100/50 border border-slate-200 rounded-full px-4 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
              <Search size={18} className="text-slate-400" />
              <input type="text" placeholder="Search for exams..." className="bg-transparent border-none outline-none text-sm ml-3 w-full placeholder-slate-400 text-slate-700" />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-5">
            
            {/* 🔔 PREMIUM NOTIFICATIONS CENTER */}
            <div className="relative" ref={notifRef}>
              
              {/* Trigger Button */}
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)} 
                className={`relative p-2.5 rounded-2xl transition-all duration-300 group ${
                  isNotifOpen || unreadCount > 0 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <div className="relative">
                  <Bell size={22} className={`transition-transform duration-300 ${isNotifOpen ? 'rotate-12' : 'group-hover:rotate-12'}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white items-center justify-center text-[8px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </span>
                  )}
                </div>
              </button>
              
              {/* MOBILE BACKDROP - Closes notification when clicking outside on mobile */}
              {isNotifOpen && (
                <div 
                  className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
                  onClick={() => setIsNotifOpen(false)}
                />
              )}
              
              {/* Dropdown Panel - Responsive Positioning */}
              {isNotifOpen && (
                <div className="fixed left-4 right-4 top-24 z-50 md:absolute md:top-full md:right-0 md:left-auto md:w-[400px] bg-white rounded-3xl shadow-2xl ring-1 ring-slate-900/5 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 origin-top">
                   
                   {/* Header */}
                   <div className="px-5 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
                     <div>
                       <h3 className="font-bold text-slate-800 text-base">Inbox</h3>
                       <p className="text-xs text-slate-500 font-medium">{unreadCount} unread updates</p>
                     </div>
                     <div className="flex gap-1">
                       {notifications.length > 0 && (
                         <>
                           {unreadCount > 0 && (
                             <button 
                               onClick={() => notifications.forEach(n => !n.read && markAsRead(n.id))}
                               className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                               title="Mark all as read"
                             >
                               <CheckCheck size={16} />
                             </button>
                           )}
                           <button 
                             onClick={clearAllNotifications} 
                             className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                             title="Clear all"
                           >
                             <Trash2 size={16} />
                           </button>
                         </>
                       )}
                       {/* Close button for Mobile */}
                       <button 
                          onClick={() => setIsNotifOpen(false)}
                          className="md:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-xl"
                       >
                         <X size={16} />
                       </button>
                     </div>
                   </div>
                   
                   {/* List Content */}
                   <div className="max-h-[60vh] md:max-h-[400px] overflow-y-auto custom-scrollbar bg-slate-50/50">
                     {pollErrorCount >= 3 ? (
                        <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                           <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-3">
                              <AlertTriangle size={24} />
                           </div>
                           <p className="text-sm font-semibold text-slate-800">Connection Issue</p>
                           <p className="text-xs text-slate-500 mt-1">We couldn't load your notifications.</p>
                        </div>
                     ) : loadingNotifs && notifications.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-3">
                          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs font-medium text-slate-400">Syncing...</span>
                        </div>
                     ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                          <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-4">
                             <Inbox size={32} />
                          </div>
                          <h4 className="text-sm font-bold text-slate-700">All caught up!</h4>
                          <p className="text-xs text-slate-400 mt-1 max-w-[200px]">When you have exams or results, they will appear here.</p>
                        </div>
                     ) : (
                        <div className="divide-y divide-slate-100">
                          {notifications.map((notif) => (
                            <div 
                              key={notif.id} 
                              onClick={() => { markAsRead(notif.id); navigate("/student/all-tests"); setIsNotifOpen(false); }} 
                              className={`relative p-4 flex gap-4 cursor-pointer transition-all duration-200 group hover:bg-slate-50 ${
                                !notif.read ? 'bg-white' : 'bg-slate-50/30'
                              }`}
                            >
                              {!notif.read && (
                                <div className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-500 rounded-r-full"></div>
                              )}

                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-colors ${
                                !notif.read 
                                  ? 'bg-indigo-50 border-indigo-100 text-indigo-600' 
                                  : 'bg-white border-slate-100 text-slate-400'
                              }`}>
                                <BookOpen size={18} strokeWidth={!notif.read ? 2.5 : 2} />
                              </div>

                              <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex justify-between items-start gap-2">
                                  <p className={`text-sm leading-tight ${!notif.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                                    {notif.title}
                                  </p>
                                  <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap flex-shrink-0">
                                    {notif.time}
                                  </span>
                                </div>
                                <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${!notif.read ? 'text-slate-600' : 'text-slate-400'}`}>
                                  {notif.desc}
                                </p>
                              </div>

                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }} 
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-100 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 md:opacity-0 opacity-100" // Always visible on mobile if desired, or relying on swipe. Here I made it visible on hover for desktop, you can adjust for mobile touch.
                                title="Remove"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                     )}
                   </div>
                   
                   {/* Footer */}
                   <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                      <button onClick={() => {navigate('/student/all-tests'); setIsNotifOpen(false);}} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider py-1">
                        View All Assessments
                      </button>
                   </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative pl-2 lg:pl-3 border-l border-slate-200" ref={profileRef}>
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 group focus:outline-none">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{user?.name || "Student"}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student</p>
                </div>
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 p-0.5 shadow-sm group-hover:shadow-md transition-all">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm lg:text-lg">
                    {user?.name?.charAt(0).toUpperCase() || "S"}
                  </div>
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="p-4 border-b border-slate-100 md:hidden">
                    <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <div className="p-2 border-b border-slate-50">
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors"><User size={16} /> My Profile</button>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { setIsProfileOpen(false); setIsLogoutModalOpen(true); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* --- CONTENT --- */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* ================= LOGOUT CONFIRMATION MODAL ================= */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsLogoutModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-4 ring-8 ring-red-50/50"><AlertTriangle className="h-8 w-8 text-red-500" /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Sign Out?</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">Are you sure you want to end your session?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleLogoutConfirm} className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 hover:-translate-y-0.5 transition-all">Yes, Sign Out</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}