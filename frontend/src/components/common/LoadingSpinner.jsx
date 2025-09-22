import React from 'react';
import { FiLoader, FiShoppingBag } from 'react-icons/fi';

const LoadingSpinner = ({ 
  size = 'medium', 
  variant = 'default', 
  text = '', 
  overlay = false,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  const SpinnerIcon = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className={`${sizeClasses[size]} bg-purple-500 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`${sizeClasses[size]} bg-pink-500 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`${sizeClasses[size]} bg-purple-500 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse`}></div>
        );
      
      case 'fashion':
        return (
          <FiShoppingBag 
            className={`${sizeClasses[size]} text-purple-500 animate-bounce`}
          />
        );
      
      case 'ring':
        return (
          <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin`}></div>
        );
      
      case 'gradient-ring':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-spin"></div>
            <div className={`absolute inset-1 rounded-full bg-white dark:bg-gray-800`}></div>
          </div>
        );
      
      default:
        return (
          <FiLoader 
            className={`${sizeClasses[size]} text-purple-500 animate-spin`}
          />
        );
    }
  };

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl max-w-sm w-full mx-4">
          <div className="text-center">
            <SpinnerIcon />
            {text && (
              <p className={`mt-4 text-gray-700 dark:text-gray-300 ${textSizeClasses[size]}`}>
                {text}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <SpinnerIcon />
      {text && (
        <p className={`mt-2 text-gray-700 dark:text-gray-300 ${textSizeClasses[size]} text-center`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Page Loading Component
export const PageLoader = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <LoadingSpinner size="xlarge" variant="gradient-ring" />
      <h2 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
        Fashion Hub
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        {message}
      </p>
    </div>
  </div>
);

// Button Loading Component
export const ButtonLoader = ({ size = 'small', className = '' }) => (
  <LoadingSpinner 
    size={size} 
    variant="default" 
    className={`inline-flex ${className}`}
  />
);

// Card Loading Component
export const CardLoader = ({ text = 'Loading content...' }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
    <div className="text-center py-8">
      <LoadingSpinner size="large" variant="fashion" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        {text}
      </p>
    </div>
  </div>
);

// Skeleton Loading Components
export const SkeletonLoader = ({ className = '', rows = 3 }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid grid-cols-3 gap-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
        </div>
      ))}
    </div>
  </div>
);

export const ImageSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}>
    <div className="flex items-center justify-center h-full">
      <FiShoppingBag className="w-8 h-8 text-gray-400" />
    </div>
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
    <div className="animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

// Table Loading Component
export const TableLoader = ({ columns = 4, rows = 5 }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="animate-pulse">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default LoadingSpinner;