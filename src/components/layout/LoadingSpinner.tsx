import React from 'react';
import Image from 'next/image';

interface LoadingSpinnerProps {
  message?: string;
  showLogo?: boolean;
  logoWidth?: number;
  logoHeight?: number;
  showBars?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Chargement en cours...",
  showLogo = true,
  logoWidth = 150,
  logoHeight = 50,
  showBars = true,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {showLogo && (
        <div className="animate-pulse flex justify-center">
          <Image 
            src="/logo_Flow.png" 
            alt="Flow Logo" 
            width={logoWidth} 
            height={logoHeight}
            priority
          />
        </div>
      )}
      
      {message && <p className="text-gray-400 mt-4">{message}</p>}
      
      {showBars && (
        <div className="mt-8">
          <div className="w-12 h-1 bg-gray-700 rounded-full mb-2 animate-pulse"></div>
          <div className="w-8 h-1 bg-gray-800 rounded-full mb-2 animate-pulse delay-150"></div>
          <div className="w-10 h-1 bg-gray-700 rounded-full animate-pulse delay-300"></div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
