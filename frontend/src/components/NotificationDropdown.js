// src/components/NotificationDropdown.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  AlertTriangle, 
  Send, 
  CheckCircle, 
  Clock,
  X,
  Loader2,
  BellOff
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

/**
 * NotificationDropdown Component
 * 
 * Displays a bell icon with notification count badge.
 * When clicked, shows a dropdown panel with expiring member notifications.
 * Each notification has a "Send Reminder" button.
 * 
 * API Endpoints Used:
 * - GET /api/notifications/expiring/ - Fetch expiring members
 * - POST /api/notifications/send-reminder/ - Send reminder to a member
 */
function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sentReminders, setSentReminders] = useState(new Set()); // Track sent reminders
  const [sendingId, setSendingId] = useState(null); // Currently sending reminder
  const dropdownRef = useRef(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // API Integration Point: GET /api/notifications/expiring/
      const response = await api.get('api/notifications/expiring/');
      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
      // Fallback: Use empty array if API fails
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Auto-refresh notifications every 60 seconds when open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isOpen, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Send reminder to a specific member
  const sendReminder = async (memberId, memberName) => {
    setSendingId(memberId);
    try {
      // API Integration Point: POST /api/notifications/send-reminder/
      await api.post('api/notifications/send-reminder/', {
        member_id: memberId
      });
      
      // Mark as sent
      setSentReminders(prev => new Set([...prev, memberId]));
      
      // Show success toast
      toast.success(`Reminder sent to ${memberName}!`, {
        icon: '📱',
        duration: 3000
      });
    } catch (err) {
      console.error('Failed to send reminder:', err);
      toast.error(`Failed to send reminder to ${memberName}`, {
        duration: 4000
      });
    } finally {
      setSendingId(null);
    }
  };

  // Calculate notification count (exclude already sent)
  const activeCount = notifications.filter(n => !sentReminders.has(n.member_id)).length;
  const hasNotifications = notifications.length > 0;

  // Get urgency color based on days left
  const getUrgencyColor = (daysLeft) => {
    if (daysLeft <= 0) return 'text-rose-600 bg-rose-50';
    if (daysLeft <= 2) return 'text-amber-600 bg-amber-50';
    return 'text-orange-500 bg-orange-50';
  };

  const getUrgencyIcon = (daysLeft) => {
    if (daysLeft <= 0) return <AlertTriangle className="w-4 h-4 text-rose-500" />;
    if (daysLeft <= 2) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <Clock className="w-4 h-4 text-orange-500" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-dark-500 hover:bg-dark-100 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        
        {/* Red Dot Badge - Only show if there are unhandled notifications */}
        <AnimatePresence>
          {hasNotifications && activeCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center"
            >
              {activeCount <= 9 ? (
                <span className="w-5 h-5 bg-rose-500 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-sm">
                  {activeCount}
                </span>
              ) : (
                <span className="w-5 h-5 bg-rose-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  9+
                </span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile - darker for better contrast */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 sm:bg-black/20"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Content - Bottom sheet on mobile, dropdown on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="
                fixed sm:absolute 
                inset-x-0 bottom-0 sm:inset-auto sm:right-0 sm:top-full sm:mt-2 
                w-full sm:w-80 md:w-96 
                bg-white 
                rounded-t-2xl sm:rounded-xl 
                shadow-xl border-t sm:border border-dark-100 
                z-50 overflow-hidden
                max-h-[85vh] sm:max-h-none
              "
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-50 to-purple-50 border-b border-dark-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold text-dark-800">Notifications</h3>
                  {hasNotifications && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-medium rounded-full">
                      {notifications.length} expiring
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/50 text-dark-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto">
                {loading ? (
                  // Loading State
                  <div className="flex flex-col items-center justify-center py-8 text-dark-500">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-2" />
                    <span className="text-sm">Loading notifications...</span>
                  </div>
                ) : error ? (
                  // Error State
                  <div className="flex flex-col items-center justify-center py-8 text-dark-500">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                    <span className="text-sm">{error}</span>
                    <button
                      onClick={fetchNotifications}
                      className="mt-2 text-primary-600 text-sm hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : notifications.length === 0 ? (
                  // Empty State
                  <div className="flex flex-col items-center justify-center py-8 text-dark-500">
                    <BellOff className="w-10 h-10 text-dark-300 mb-2" />
                    <span className="font-medium text-dark-600">All caught up!</span>
                    <span className="text-sm text-dark-400">No expiring memberships</span>
                  </div>
                ) : (
                  // Notification List
                  <ul className="divide-y divide-dark-100">
                    {notifications.map((notification, index) => {
                      const isSent = sentReminders.has(notification.member_id);
                      const isSending = sendingId === notification.member_id;
                      
                      return (
                        <motion.li
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-3 sm:p-4 hover:bg-dark-50 transition-colors ${isSent ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            {/* Icon */}
                            <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${getUrgencyColor(notification.days_left)}`}>
                              {getUrgencyIcon(notification.days_left)}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-dark-800 truncate text-sm sm:text-base">
                                {notification.member_name}
                              </p>
                              <p className={`text-xs sm:text-sm font-medium ${
                                notification.days_left <= 0 
                                  ? 'text-rose-600' 
                                  : notification.days_left <= 2 
                                    ? 'text-amber-600' 
                                    : 'text-orange-500'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-dark-400 mt-0.5">
                                📞 {notification.phone}
                              </p>
                            </div>
                            
                            {/* Send Reminder Button */}
                            <motion.button
                              onClick={() => sendReminder(notification.member_id, notification.member_name)}
                              disabled={isSent || isSending}
                              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex-shrink-0 ${
                                isSent
                                  ? 'bg-emerald-100 text-emerald-600 cursor-default'
                                  : isSending
                                    ? 'bg-dark-100 text-dark-400 cursor-wait'
                                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200 active:scale-95'
                              }`}
                              whileHover={!isSent && !isSending ? { scale: 1.02 } : {}}
                              whileTap={!isSent && !isSending ? { scale: 0.98 } : {}}
                            >
                              {isSent ? (
                                <>
                                  <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  <span>Sent</span>
                                </>
                              ) : isSending ? (
                                <>
                                  <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
                                  <span className="hidden xs:inline">Sending...</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  <span>Remind</span>
                                </>
                              )}
                            </motion.button>
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Footer */}
              {!loading && notifications.length > 0 && (
                <div className="px-4 py-3 bg-dark-50 border-t border-dark-100">
                  <p className="text-xs text-dark-500 text-center">
                    {sentReminders.size > 0 && (
                      <span className="text-emerald-600 font-medium">
                        {sentReminders.size} reminder{sentReminders.size !== 1 ? 's' : ''} sent • 
                      </span>
                    )}
                    {' '}Showing members expiring within 7 days
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationDropdown;
