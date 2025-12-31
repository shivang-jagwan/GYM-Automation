// src/components/Sidebar.js
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  LogOut,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/members', icon: Users, label: 'Members' },
  { path: '/broadcast', icon: Megaphone, label: 'Broadcast' },
];

function Sidebar({ collapsed, setCollapsed, onLogout, mobile = false, onClose }) {
  const location = useLocation();

  // Handle navigation click on mobile - close sidebar
  const handleNavClick = () => {
    if (mobile && onClose) {
      onClose();
    }
  };

  return (
    <motion.aside
      className={`
        fixed left-0 top-0 h-screen bg-dark-900 text-white z-40 flex flex-col
        ${mobile ? 'w-full' : ''}
      `}
      initial={false}
      animate={{ width: mobile ? '100%' : (collapsed ? 80 : 260) }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0"
              whileHover={{ scale: 1.05 }}
            >
              <Dumbbell className="w-6 h-6" />
            </motion.div>
            <AnimatePresence>
              {(!collapsed || mobile) && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="font-bold text-lg">GymPro</h1>
                  <p className="text-xs text-dark-400">Management System</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Close button for mobile */}
          {mobile && onClose && (
            <motion.button
              onClick={onClose}
              className="p-2 rounded-lg text-dark-400 hover:bg-dark-800 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto hide-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="block"
              onClick={handleNavClick}
            >
              <motion.div
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-600 text-white shadow-glow' 
                    : 'text-dark-400 hover:bg-dark-800 hover:text-white'
                  }
                `}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {(!collapsed || mobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Button - Only show on desktop */}
      {!mobile && (
        <div className="p-4 border-t border-dark-700">
          <motion.button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-dark-400 hover:bg-dark-800 hover:text-white transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Collapse</span>
              </>
            )}
          </motion.button>
        </div>
      )}

      {/* Logout Button */}
      <div className="p-4 border-t border-dark-700">
        <motion.button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-dark-400 hover:bg-rose-600/10 hover:text-rose-500 transition-all duration-200"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {(!collapsed || mobile) && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
