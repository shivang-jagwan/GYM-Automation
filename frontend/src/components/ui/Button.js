// src/components/ui/Button.js
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800',
  secondary: 'bg-dark-100 text-dark-700 hover:bg-dark-200 focus:ring-dark-300 active:bg-dark-300',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500',
  warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400',
  ghost: 'bg-transparent text-dark-600 hover:bg-dark-100 focus:ring-dark-200',
  outline: 'border-2 border-primary-600 text-primary-600 bg-transparent hover:bg-primary-600 hover:text-white focus:ring-primary-500',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 rounded-lg font-medium
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </motion.button>
  );
}

export default Button;
