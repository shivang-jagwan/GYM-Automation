// src/components/ui/Input.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helper,
  icon: Icon,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-dark-700">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <motion.input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full rounded-lg border bg-white px-4 py-3
            transition-all duration-200 placeholder:text-dark-400
            focus:outline-none focus:ring-2 focus:border-transparent
            disabled:bg-dark-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-11' : ''}
            ${type === 'password' ? 'pr-11' : ''}
            ${error 
              ? 'border-rose-500 focus:ring-rose-500' 
              : 'border-dark-200 focus:ring-primary-500'
            }
          `}
          animate={{
            boxShadow: isFocused 
              ? '0 0 0 3px rgba(99, 102, 241, 0.1)' 
              : '0 0 0 0 rgba(99, 102, 241, 0)',
          }}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-1 text-xs text-rose-600"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      {helper && !error && (
        <p className="text-xs text-dark-500">{helper}</p>
      )}
    </div>
  );
}

export default Input;
