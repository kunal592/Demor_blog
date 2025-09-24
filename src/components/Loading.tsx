import React from 'react';

interface LoadingProps {
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ fullScreen }) => {
  const wrapperClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={wrapperClasses}>
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};

export default Loading;
