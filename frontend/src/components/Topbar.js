// src/components/Topbar.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  User,
  ChevronDown,
  LogOut,
  Settings,
} from 'lucide-react';
import { subscribeToSystemStatus } from '../api/axios';
import NotificationDropdown from './NotificationDropdown';

const pageNames = {
  '/dashboard': 'Dashboard',
  '/members': 'Members',
  '/members/add': 'Add Member',
  '/broadcast': 'Broadcast',
};

function Topbar({ onMenuClick, onLogout }) {
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  // TWEAK 3: System status state (online/offline)
  const [isOnline, setIsOnline] = useState(true);
  
  const currentPage = pageNames[location.pathname] || 'Dashboard';

  // TWEAK 3: Subscribe to system status changes
  useEffect(() => {
    const unsubscribe = subscribeToSystemStatus((status) => {
      setIsOnline(status);
    });
    return unsubscribe;
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-dark-100">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <motion.button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-dark-500 hover:bg-dark-100 lg:hidden flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
          
          <div className="min-w-0">
            <motion.h1
              key={currentPage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg sm:text-xl font-semibold text-dark-900 truncate"
            >
              {currentPage}
            </motion.h1>
            {/* Hide date on very small screens */}
            <p className="text-xs sm:text-sm text-dark-500 hidden xs:block">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
            {/* Full date on larger screens */}
            <p className="text-sm text-dark-500 hidden md:block xs:hidden">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
          {/* TWEAK 3: System Status Indicator - Hide on very small screens */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-dark-50" title={isOnline ? 'System Online' : 'System Offline'}>
            <span 
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                isOnline ? 'bg-emerald-500' : 'bg-dark-300'
              }`}
            />
            <span className="text-xs text-dark-500 hidden md:inline">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Notifications - Functional Dropdown */}
          <NotificationDropdown />

          {/* User Menu */}
          <div className="relative">
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg hover:bg-dark-100 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden md:block font-medium text-dark-700">Admin</span>
              <ChevronDown className={`w-4 h-4 text-dark-500 transition-transform hidden sm:block ${showUserMenu ? 'rotate-180' : ''}`} />
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowUserMenu(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-dark-100 py-2 z-20"
                  >
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-dark-600 hover:bg-dark-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <hr className="my-2 border-dark-100" />
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
