import React from 'react';

interface CineVerseLogoProps {
  size?: number;
  variant?: 'full' | 'icon';
}

export const CineVerseLogo: React.FC<CineVerseLogoProps> = ({ size = 40, variant = 'full' }) => {
  // Generate unique IDs for each instance to avoid conflicts
  const uniqueId = React.useId();
  const iconGradId = `iconGrad-${uniqueId}`;
  const fullGradId = `grad-${uniqueId}`;
  
  if (variant === 'icon') {
    // Icon-only version for collapsed sidebar
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill={`url(#${iconGradId})`} />
        <path d="M12 10L20 15L28 10V30L20 25L12 30V10Z" fill="white" fillOpacity="0.95" />
        <circle cx="20" cy="20" r="3" fill="#E50914" />
        <defs>
          <linearGradient id={iconGradId} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E50914" />
            <stop offset="1" stopColor="#B20710" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Full logo with text
  return (
    <svg width={size * 4.5} height={size} viewBox="0 0 180 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Icon */}
      <rect width="40" height="40" rx="8" fill={`url(#${fullGradId})`} />
      <path d="M12 10L20 15L28 10V30L20 25L12 30V10Z" fill="white" fillOpacity="0.95" />
      <circle cx="20" cy="20" r="3" fill="#E50914" />
      
      {/* CineVerse Text */}
      <text x="50" y="27" fontFamily="'Inter', sans-serif" fontSize="20" fontWeight="700" fill="#FFFFFF" letterSpacing="-0.5">
        CineVerse
      </text>
      
      <defs>
        <linearGradient id={fullGradId} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E50914" />
          <stop offset="1" stopColor="#B20710" />
        </linearGradient>
      </defs>
    </svg>
  );
};