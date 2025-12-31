// src/components/ui/Table.js
import React from 'react';
import { motion } from 'framer-motion';

function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-dark-200 ${className}`}>
      <table className="w-full text-sm text-left min-w-[600px] sm:min-w-0">
        {children}
      </table>
    </div>
  );
}

function TableHead({ children }) {
  return (
    <thead className="bg-dark-50 text-dark-600 uppercase text-xs tracking-wider">
      {children}
    </thead>
  );
}

function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

function TableRow({ children, index = 0, onClick, className = '' }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      onClick={onClick}
      className={`
        border-b border-dark-100 bg-white transition-colors duration-150
        hover:bg-dark-50 ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.tr>
  );
}

function TableHeader({ children, className = '', hideOnMobile = false }) {
  return (
    <th className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 font-semibold whitespace-nowrap ${hideOnMobile ? 'hidden sm:table-cell' : ''} ${className}`}>
      {children}
    </th>
  );
}

function TableCell({ children, className = '', hideOnMobile = false, mobileLabel = '' }) {
  return (
    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 ${hideOnMobile ? 'hidden sm:table-cell' : ''} ${className}`}>
      {/* Mobile label for context when needed */}
      {mobileLabel && (
        <span className="sm:hidden text-xs text-dark-400 block mb-0.5">{mobileLabel}</span>
      )}
      {children}
    </td>
  );
}

Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Header = TableHeader;
Table.Cell = TableCell;

export default Table;
