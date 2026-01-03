import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios"; 
import { 
  LayoutDashboard, FilePlus, PlusCircle, UploadCloud, BarChart2, 
  Award, Settings, Users, LogOut, Menu, X, Search, Bell, 
  ChevronDown, FileText, Trash2, AlertTriangle, UserPlus, ClipboardCheck, CheckCircle
} from "lucide-react";

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // --- UI States ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // --- Data States ---
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // --- FETCH NOTIFICATIONS FROM NEW BACKEND ---
  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      // 👇 THIS IS THE FIX: Fetch from your new backend route
      const { data } = await api.get("/notifications");
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Optional: Auto-refresh bell every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- Actions ---
  const markAsRead = async (id, link) => {
    try {
      // Optimistic UI Update
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      
      // Call Backend
      await api.put(`/notifications/${id}/read`);
      
      if(link && link !== '#') {
        navigate(link);
        setIsNotifOpen(false);
      }
    } catch (error) {
      console.error("Error marking read", error);
    }
  };

  const clearNotification = async (id, e) => {
    e.stopPropagation();
    try {
      setNotifications(prev => prev.filter(n => n._id !== id));
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      console.error("Error deleting", error);
    }
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // --- Helper: Get Icons based on type ---
  const getIcon = (type) => {
    switch(type) {
      case 'student': return <UserPlus size={16} />;
      case 'result': return <ClipboardCheck size={16} />;
      case 'test': return <FileText size={16} />;
      case 'system': return <CheckCircle size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const getColors = (type) => {
    switch(type) {
      case 'student': return "bg-green-100 text-green-600";
      case 'result': return "bg-purple-100 text-purple-600";
      case 'test': return "bg-blue-100 text-blue-600";
      case 'system': return "bg-orange-100 text-orange-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  // --- Sidebar Link Component ---
  const SidebarLink = ({ to, label, icon }) => (
    <Link
      to={to}
      onClick={() => setIsSidebarOpen(false)}
      className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden font-medium text-[15px] ${
        isActive(to)
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-1"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-1"
      }`}
    >
      <span className={`relative z-10 transition-transform duration-300 ${isActive(to) ? "scale-110" : "group-hover:scale-110"}`}>
        {icon}
      </span>
      <span className="relative z-10">{label}</span>
      {isActive(to) && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20"></div>}
    </Link>
  );

  // --- Click Outside Logic ---
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-800">
      
      {/* 1. SIDEBAR */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-slate-200 shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] lg:translate-x-0 lg:static flex flex-col
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">Alok Pathshala</h1>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden ml-auto text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-5 py-6 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Overview</p>
          <nav className="space-y-1 mb-6">
            <SidebarLink to="/admin" label="Dashboard" icon={<LayoutDashboard size={20} />} />
            <SidebarLink to="/admin/notifications" label="Notifications" icon={<Bell size={20} />} />
            <SidebarLink to="/admin/results" label="Results Analytics" icon={<BarChart2 size={20} />} />
            <SidebarLink to="/admin/leaderboard" label="Global Leaderboard" icon={<Award size={20} />} />
            <SidebarLink to="/admin/students" label="Student Management" icon={<Users size={20} />} />
          </nav>

          <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Test Management</p>
          <nav className="space-y-1">
            <SidebarLink to="/admin/create-test" label="Create New Test" icon={<FilePlus size={20} />} />
            <SidebarLink to="/admin/manage-tests" label="Manage Tests" icon={<Settings size={20} />} />
            <SidebarLink to="/admin/add-question" label="Add Questions" icon={<PlusCircle size={20} />} />
            <SidebarLink to="/admin/bulk-upload" label="Bulk Upload" icon={<UploadCloud size={20} />} />
          </nav>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50/50">
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>


      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* TOP NAVBAR */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-30 sticky top-0">
          
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl lg:hidden transition-colors">
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center w-full max-w-md bg-slate-100/50 border border-slate-200 rounded-full px-4 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <Search size={18} className="text-slate-400" />
              <input type="text" placeholder="Search students, tests..." className="bg-transparent border-none outline-none text-sm ml-3 w-full text-slate-700" />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-5">
            
            {/* NOTIFICATION BELL */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2.5 rounded-full transition-all duration-200 ${isNotifOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-[-70px] md:right-0 mt-4 w-[90vw] max-w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-3 z-50">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                    <Link to="/admin/notifications" onClick={() => setIsNotifOpen(false)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View All</Link>
                  </div>
                  
                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    {loadingNotifs ? (
                        <div className="p-8 text-center text-slate-400 text-xs">Checking updates...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <Bell size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No new alerts</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div 
                          key={notif._id} 
                          onClick={() => markAsRead(notif._id, notif.link)}
                          className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-4 cursor-pointer group ${notif.isRead ? 'opacity-60 bg-white' : 'bg-indigo-50/10'}`}
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${getColors(notif.type)}`}>
                             {getIcon(notif.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="text-sm font-semibold text-slate-800">{notif.title}</p>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{new Date(notif.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                          </div>
                          <button onClick={(e) => clearNotification(notif._id, e)} className="text-slate-300 hover:text-red-500 p-1.5 self-center">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE MENU */}
            <div className="relative pl-3 border-l border-slate-200" ref={profileRef}>
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 group focus:outline-none">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-700">{user?.name || "Admin"}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Administrator</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 p-0.5 shadow-sm group-hover:shadow-md transition-all">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {user?.name?.charAt(0).toUpperCase() || "A"}
                  </div>
                </div>
                <ChevronDown size={16} className="text-slate-400 hidden md:block" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="p-4 border-b border-slate-100 md:hidden">
                    <p className="text-sm font-bold text-slate-800">{user?.name}</p>
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

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full">
             {children}
          </div>
        </main>

        {/* LOGOUT MODAL */}
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsLogoutModalOpen(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Sign Out?</h3>
                <p className="text-sm text-slate-500 mb-8">Are you sure you want to end your session?</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">Cancel</button>
                <button onClick={handleLogoutConfirm} className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200">Yes, Sign Out</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}