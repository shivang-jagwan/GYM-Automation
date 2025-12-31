// src/pages/Broadcast.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, 
  Send, 
  Users, 
  CheckCircle2,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Button, PageTransition } from '../components/ui';

function Broadcast() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSend = async e => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    setLoading(true);
    setSuccess(false);
    try {
      await api.post('/api/broadcast/', { message });
      setSuccess(true);
      setMessage('');
      toast.success('Message sent to all active members!');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const characterCount = message.length;
  const maxCharacters = 500;

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto">
        {/* Header - Responsive */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-dark-900">Broadcast Message</h2>
          <p className="text-sm sm:text-base text-dark-500 mt-0.5 sm:mt-1">Send a message to all active members</p>
        </div>

        {/* Info Card - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-primary-100"
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg flex-shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-medium text-dark-900 text-sm sm:text-base">Broadcast to All Members</h3>
              <p className="text-xs sm:text-sm text-dark-600 mt-0.5 sm:mt-1">
                Your message will be sent to all active gym members via their registered contact method.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form Card - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-card p-4 sm:p-6"
        >
          <form onSubmit={handleSend} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Message Content
              </label>
              <div className="relative">
                <textarea
                  value={message}
                  onChange={e => {
                    if (e.target.value.length <= maxCharacters) {
                      setMessage(e.target.value);
                    }
                  }}
                  placeholder="Type your message here... (e.g., Holiday hours, special offers, announcements)"
                  rows={5}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-dark-200 bg-white transition-all duration-200 placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm sm:text-base"
                  required
                />
                <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-xs text-dark-400">
                  <span className={characterCount > maxCharacters * 0.9 ? 'text-amber-500' : ''}>
                    {characterCount}
                  </span>
                  /{maxCharacters}
                </div>
              </div>
            </div>

            {/* Quick Templates - Responsive */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Quick Templates
              </label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[
                  'Gym will be closed tomorrow for maintenance.',
                  'Special offer: 20% off on annual memberships!',
                  'New equipment arrived! Come check it out.',
                ].map((template, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    onClick={() => setMessage(template)}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-dark-100 text-dark-600 rounded-lg hover:bg-dark-200 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="hidden xs:inline">{template.substring(0, 30)}...</span>
                    <span className="xs:hidden">{template.substring(0, 20)}...</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700"
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Message Sent Successfully!</p>
                    <p className="text-xs sm:text-sm text-emerald-600">All active members have been notified.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions - Stack on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-4 border-t border-dark-100">
              <p className="text-xs sm:text-sm text-dark-500 order-2 sm:order-1">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Message cannot be recalled once sent
              </p>
              <Button 
                type="submit" 
                loading={loading}
                icon={Send}
                iconPosition="right"
                disabled={!message.trim()}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                Send Broadcast
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Tips Card - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 sm:mt-6 bg-white rounded-xl shadow-card p-4 sm:p-6"
        >
          <h3 className="font-semibold text-dark-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            Tips for Effective Broadcasts
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-dark-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
              Keep messages clear and concise
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
              Include relevant dates and times for events
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
              Avoid sending too many messages to prevent notification fatigue
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" />
              Use for important announcements, offers, and schedule changes
            </li>
          </ul>
        </motion.div>
      </div>
    </PageTransition>
  );
}

export default Broadcast;
