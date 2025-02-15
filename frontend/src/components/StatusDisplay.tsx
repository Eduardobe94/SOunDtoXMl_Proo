import React from 'react';

interface StatusDisplayProps {
  status: string;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status }) => {
  if (!status) return null;

  const isCompleted = status.toLowerCase().includes('completado');

  return (
    <div className="w-full mx-auto p-6 bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-2xl">
      <div className="flex items-center space-x-3">
        {isCompleted ? (
          <svg 
            className="h-5 w-5 text-green-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        ) : (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
        )}
        <span className={`font-medium ${
          isCompleted ? 'text-green-400' : 'text-purple-300'
        }`}>
          {status}
        </span>
      </div>
    </div>
  );
};

export default StatusDisplay; 