// src/components/ui/Modal.js
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    }
  },
};

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Centered container with responsive padding */}
          <div className="min-h-screen px-3 sm:px-4 py-4 sm:py-6 flex items-center justify-center">
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={onClose}
            />

            {/* Modal - Full width on mobile with small margins */}
            <motion.div
              className={`relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full ${sizes[size]} overflow-hidden max-h-[90vh] flex flex-col`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Header - Responsive padding */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-dark-100 flex-shrink-0">
                  {title && (
                    <h3 className="text-base sm:text-lg font-semibold text-dark-900 pr-2">
                      {title}
                    </h3>
                  )}
                  {showCloseButton && (
                    <motion.button
                      onClick={onClose}
                      className="p-1.5 sm:p-2 rounded-lg text-dark-400 hover:text-dark-600 hover:bg-dark-100 transition-colors flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              )}

              {/* Content - Scrollable with responsive padding */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
