// src/components/ui/EmptyState.js
import React from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import Button from './Button';

function EmptyState({
  icon: Icon = Inbox,
  title = 'No data found',
  description = 'There are no items to display at this time.',
  action,
  actionLabel = 'Add New',
  onAction,
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="p-4 bg-dark-100 rounded-full mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Icon className="w-8 h-8 text-dark-400" />
      </motion.div>
      <h3 className="text-lg font-semibold text-dark-900 mb-1">{title}</h3>
      <p className="text-dark-500 text-center max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={onAction} icon={action}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}

export default EmptyState;
