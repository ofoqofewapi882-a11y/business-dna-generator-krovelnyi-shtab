import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
      <div className="flex justify-between items-center mb-2 text-sm text-slate-500 font-medium">
        <span>Блок {Math.min(current, total)} из {total}</span>
        <span>{Math.min(percentage, 100)}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
