// src/components/ui/Card.js
import React from 'react';
import { motion } from 'framer-motion';

function Card({
  children,
  className = '',
  hover = false,
  padding = true,
  ...props
}) {
  return (
    <motion.div
      className={`
        bg-white rounded-xl shadow-card
        ${padding ? 'p-6' : ''}
        ${hover ? 'hover:shadow-card-hover hover:-translate-y-1' : ''}
        transition-all duration-300
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stat Card with gradient background
// TWEAK 2: Added pulse prop for attention highlight on "Expiring Soon" card
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  gradient = 'from-primary-600 to-primary-700',
  delay = 0,
  pulse = false, // TWEAK 2: Pulse animation flag
}) {
  // TWEAK 2: Check for prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // TWEAK 2: Only apply pulse if enabled and user doesn't prefer reduced motion
  const shouldPulse = pulse && !prefersReducedMotion;

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl p-4 sm:p-6 text-white bg-gradient-to-br ${gradient} ${
        shouldPulse ? 'animate-attention-pulse' : ''
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      // TWEAK 2: Add subtle box-shadow pulse for attention
      style={shouldPulse ? {
        boxShadow: '0 0 0 0 rgba(251, 191, 36, 0.4)',
        animation: 'attention-pulse 2s ease-in-out infinite',
      } : {}}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-xl" />
      
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-white/80 text-xs sm:text-sm font-medium truncate">{title}</p>
            <motion.p
              className="text-2xl sm:text-3xl font-bold mt-0.5 sm:mt-1"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: delay + 0.2 }}
            >
              {value}
            </motion.p>
          </div>
          {Icon && (
            <div className="p-2 sm:p-3 bg-white/20 rounded-lg flex-shrink-0 ml-2">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          )}
        </div>
        
        {trend && (
          <div className="flex items-center gap-1 mt-2 sm:mt-3">
            <span className={`text-xs sm:text-sm ${trend === 'up' ? 'text-emerald-300' : 'text-rose-300'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </span>
            <span className="text-white/60 text-xs sm:text-sm hidden xs:inline">vs last month</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

Card.Stat = StatCard;

export default Card;
