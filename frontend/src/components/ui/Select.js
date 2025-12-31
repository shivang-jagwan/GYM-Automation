// src/components/ui/Select.js
import React from 'react';
import { ChevronDown } from 'lucide-react';

function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-dark-700">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full appearance-none rounded-lg border bg-white px-4 py-3 pr-10
            transition-all duration-200 cursor-pointer
            focus:outline-none focus:ring-2 focus:border-transparent
            disabled:bg-dark-50 disabled:cursor-not-allowed
            ${error 
              ? 'border-rose-500 focus:ring-rose-500' 
              : 'border-dark-200 focus:ring-primary-500'
            }
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dark-400">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
      {error && (
        <p className="text-xs text-rose-600">{error}</p>
      )}
    </div>
  );
}

export default Select;
