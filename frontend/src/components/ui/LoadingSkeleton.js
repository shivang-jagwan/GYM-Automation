// src/components/ui/LoadingSkeleton.js
import React from 'react';

function LoadingSkeleton({ className = '', variant = 'text' }) {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-10 w-10 rounded-full',
    card: 'h-32 w-full rounded-xl',
    button: 'h-10 w-24 rounded-lg',
    stat: 'h-28 w-full rounded-xl',
  };

  return (
    <div
      className={`
        bg-dark-200 rounded animate-pulse
        ${variants[variant]}
        ${className}
      `}
    />
  );
}

// Table skeleton
function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-dark-50 rounded-t-xl">
        {[...Array(columns)].map((_, i) => (
          <LoadingSkeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-4 border-b border-dark-100">
          {[...Array(columns)].map((_, colIndex) => (
            <LoadingSkeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Stats skeleton
function StatsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <LoadingSkeleton key={i} variant="stat" />
      ))}
    </div>
  );
}

// Card skeleton
function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-card space-y-4">
      <LoadingSkeleton variant="title" />
      <LoadingSkeleton className="h-4 w-full" />
      <LoadingSkeleton className="h-4 w-5/6" />
      <LoadingSkeleton className="h-4 w-4/6" />
    </div>
  );
}

LoadingSkeleton.Table = TableSkeleton;
LoadingSkeleton.Stats = StatsSkeleton;
LoadingSkeleton.Card = CardSkeleton;

export default LoadingSkeleton;
