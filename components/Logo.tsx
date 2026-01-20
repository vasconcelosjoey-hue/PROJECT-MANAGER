
import React from 'react';

export const Logo: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = "" }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <path d="M50 5L90 25V75L50 95L10 75V25L50 5Z" fill="url(#logoGradient)" />
        <path d="M30 35H70V45H55V65H45V45H30V35Z" fill="white" />
        <path d="M50 15L80 30V70L50 85L20 70V30L50 15ZM50 20L25 32.5V67.5L50 80L75 67.5V32.5L50 20Z" fill="white" fillOpacity="0.2" />
      </svg>
    </div>
  );
};
