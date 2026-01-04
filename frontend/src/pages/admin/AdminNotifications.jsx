import React, { useEffect, useState, useMemo, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns"; 
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../api/axios";
import { 
  Bell, FileText, CheckCircle, AlertTriangle, 
  UserPlus, ClipboardCheck, ArrowRight, Trash2, 
  CheckCheck, Filter, Search, X 
} from "lucide-react";

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // --- FETCH DATA ---
  const fetchNotifications = async () => {
    try {
      // setLoading(true); // Don't reload spinner on polling
      const { data } = await api.get("/notifications");
      setActivities(data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---
  const handleRead = async (id, link) => {
    try {
      // Optimistic UI Update
      setActivities(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      await api.put(`/notifications/${id}/read`);
      if (link && link !== '#') navigate(link);
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      setActivities(prev => prev.map(n => ({ ...n, isRead: true })));
      await api.put(`/notifications/read-all`);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      setActivities(prev => prev.filter(n => n._id !== id));
      await api.delete(`/notifications/${id}`);
    } catch (err) { console.error(err); }
  };

  // --- PROCESSED DATA ---
  const filteredActivities = useMemo(() => {
    return activities.filter(item => {
      const matchesFilter = filter === "all" ? true : item.type === filter;
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.message.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activities, filter, searchTerm]);

  const unreadCount = activities.filter(n => !n.isRead).length;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto px-2 py- min-h-screen">
        
        {/* === HEADER SECTION === */}
<div className="bg-gradient-to-r from-indigo-50/80 via-white to-white border border-indigo-100 rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
    
    {/* Left Side: Title & Badge */}
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Notification Center
        </h1>
        
        {/* Animated Badge */}
        {unreadCount > 0 ? (
          <span className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md shadow-red-200 animate-pulse">
            <BellRing size={12} fill="currentColor" />
            {unreadCount} NEW
          </span>
        ) : (
          <span className="flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">
            <Bell size={12} />
            All Caught Up
          </span>
        )}
      </div>
      <p className="text-gray-500 mt-2 font-medium">
        Stay updated with the latest system activities and alerts.
      </p>
    </div>
    
    {/* Right Side: Action Button */}
    <button 
      onClick={handleMarkAllRead}
      disabled={unreadCount === 0}
      className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
        unreadCount === 0 
          ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100' 
          : 'bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-sm hover:shadow-indigo-200 hover:-translate-y-0.5'
      }`}
    >
      <CheckCheck size={18} className={unreadCount > 0 ? "group-hover:text-white" : ""} /> 
      <span>Mark all as read</span>
    </button>
  </div>
</div>

        {/* === TOOLBAR === */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-3 sticky top-4 z-20">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search notifications..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 rounded-xl transition-all outline-none font-medium"
            />
          </div>
          
          {/* Filter Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
            {['all', 'student', 'result', 'test', 'system'].map((f) => (
              <button 
                key={f} 
                onClick={() => setFilter(f)} 
                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* === CONTENT LIST === */}
        <div className="space-y-4">
          {loading && activities.length === 0 ? (
             <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
             </div>
          ) : filteredActivities.length === 0 ? (
             <EmptyState filter={filter} />
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredActivities.map((item) => (
                <NotificationCard 
                  key={item._id} 
                  item={item} 
                  onRead={handleRead} 
                  onDelete={handleDelete} 
                />
              ))}
            </AnimatePresence>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}

// ================= SUB-COMPONENTS =================

// NOTE: forwardRef is required here so framer-motion can animate the exit correctly
const NotificationCard = forwardRef(({ item, onRead, onDelete }, ref) => {
  const styles = getTypeStyles(item.type);
  // Calculate relative time (e.g., "2 mins ago")
  const timeAgo = item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : "Just now";

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100 }}
      whileHover={{ scale: 1.005 }}
      onClick={() => onRead(item._id, item.link)}
      className={`relative group p-5 rounded-2xl border transition-all cursor-pointer flex gap-5 items-start
        ${item.isRead 
          ? 'bg-white border-gray-100' 
          : 'bg-white border-indigo-100 shadow-lg shadow-indigo-100/40 ring-1 ring-indigo-50'
        }
      `}
    >
      {/* Unread Indicator Dot */}
      {!item.isRead && (
        <span className="absolute top-5 right-5 w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span>
      )}

      {/* Icon Box */}
      <div className={`w-14 h-14 rounded-2xl ${styles.bg} ${styles.text} flex items-center justify-center shrink-0 shadow-sm`}>
        {styles.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1">
          <h3 className={`text-base ${item.isRead ? 'font-semibold text-gray-700' : 'font-black text-gray-900'}`}>
            {item.title}
          </h3>
          <span className="text-xs font-medium text-gray-400 whitespace-nowrap flex items-center gap-1">
             {timeAgo}
          </span>
        </div>
        
        <p className={`text-sm mt-1 line-clamp-2 ${item.isRead ? 'text-gray-400' : 'text-gray-600'}`}>
          {item.message}
        </p>

        {/* Action Footer */}
        <div className="mt-3 flex items-center gap-4">
           {item.link && item.link !== '#' && (
             <span className="text-xs font-bold text-indigo-600 group-hover:underline flex items-center gap-1">
               View Details <ArrowRight size={12} />
             </span>
           )}
        </div>
      </div>

      {/* Hover Delete Button */}
      <button 
        onClick={(e) => onDelete(item._id, e)}
        className="absolute bottom-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        title="Delete Notification"
      >
        <Trash2 size={18} />
      </button>
    </motion.div>
  );
});

const EmptyState = ({ filter }) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100"
  >
    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
      <Bell size={32} className="text-gray-300" />
    </div>
    <h3 className="text-xl font-bold text-gray-800">All caught up!</h3>
    <p className="text-gray-400 max-w-xs text-center mt-2">
      {filter === 'all' 
        ? "You have no new notifications at the moment." 
        : `No notifications found in the "${filter}" category.`}
    </p>
  </motion.div>
);

// Helper for Styles
const getTypeStyles = (type) => {
  switch(type) {
      case 'test': return { bg: 'bg-blue-50', text: 'text-blue-600', icon: <FileText size={24} /> };
      case 'student': return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <UserPlus size={24} /> };
      case 'result': return { bg: 'bg-purple-50', text: 'text-purple-600', icon: <ClipboardCheck size={24} /> };
      case 'system': return { bg: 'bg-orange-50', text: 'text-orange-600', icon: <AlertTriangle size={24} /> };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', icon: <Bell size={24} /> };
  }
};