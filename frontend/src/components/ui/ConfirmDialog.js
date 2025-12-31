// src/components/ui/ConfirmDialog.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const iconColors = {
    danger: 'bg-rose-100 text-rose-600',
    warning: 'bg-amber-100 text-amber-600',
    info: 'bg-blue-100 text-blue-600',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 flex items-center justify-center">
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Dialog */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${iconColors[variant]}`}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-dark-900">
                      {title}
                    </h3>
                    <p className="text-dark-500 mt-1">
                      {message}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg text-dark-400 hover:text-dark-600 hover:bg-dark-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="secondary" onClick={onClose}>
                    {cancelText}
                  </Button>
                  <Button 
                    variant={variant} 
                    onClick={onConfirm}
                    loading={loading}
                  >
                    {confirmText}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;
