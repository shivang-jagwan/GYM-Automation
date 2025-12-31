// src/components/ui/SearchInput.js
import React from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}) {
  const handleClear = () => {
    onChange({ target: { value: '' } });
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full pl-10 pr-10 py-2.5 rounded-lg border border-dark-200 bg-white
          transition-all duration-200 placeholder:text-dark-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
        "
      />
      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-dark-400 hover:text-dark-600 hover:bg-dark-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchInput;
