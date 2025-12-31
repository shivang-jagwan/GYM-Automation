// src/components/Layout.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function Layout({ children, onLogout }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          onLogout={onLogout}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-screen z-50 lg:hidden w-[280px] max-w-[85vw]"
            >
              <Sidebar
                collapsed={false}
                setCollapsed={() => {}}
                mobile={true}
                onClose={() => setMobileMenuOpen(false)}
                onLogout={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        className="lg:transition-all lg:duration-300"
        style={{
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 
            ? (sidebarCollapsed ? 80 : 260) 
            : 0
        }}
        animate={{
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 
            ? (sidebarCollapsed ? 80 : 260) 
            : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <Topbar
          onMenuClick={() => setMobileMenuOpen(true)}
          onLogout={onLogout}
        />
        
        {/* Responsive padding for main content */}
        <main className="p-3 sm:p-4 md:p-6">
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
}

export default Layout;
