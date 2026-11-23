import React from 'react';

const ProgressBar = ({ progress = 0, size = 'md', showLabel = true }) => {
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5'
  }[size] || 'h-2.5';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
          <span>Progress</span>
          <span className={safeProgress === 100 ? 'text-emerald-600 font-bold' : 'text-brand-600'}>
            {safeProgress}% {safeProgress === 100 && '• Completed!'}
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            safeProgress === 100
              ? 'bg-emerald-500'
              : 'bg-gradient-to-r from-brand-500 to-indigo-600'
          }`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
