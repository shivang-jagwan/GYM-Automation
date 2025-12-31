// src/components/ui/Badge.js
import React from 'react';

const variants = {
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-rose-100 text-rose-800',
  info: 'bg-blue-100 text-blue-800',
  primary: 'bg-primary-100 text-primary-800',
  secondary: 'bg-dark-100 text-dark-800',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

function Badge({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className = '',
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success' ? 'bg-emerald-500' :
          variant === 'warning' ? 'bg-amber-500' :
          variant === 'danger' ? 'bg-rose-500' :
          variant === 'info' ? 'bg-blue-500' :
          'bg-primary-500'
        }`} />
      )}
      {children}
    </span>
  );
}

export default Badge;
