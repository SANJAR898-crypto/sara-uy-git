import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'white-text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function SaraUylarLogo({ className = '', variant = 'full', size = 'md' }: LogoProps) {
  const getDimensions = () => {
    switch (size) {
      case 'sm': return { width: 'w-10', height: 'h-10', text: 'text-xs', spacing: 'gap-1' };
      case 'lg': return { width: 'w-20', height: 'h-20', text: 'text-xl', spacing: 'gap-3' };
      case 'xl': return { width: 'w-32', height: 'h-32', text: 'text-3xl', spacing: 'gap-4' };
      case 'md':
      default: return { width: 'w-14', height: 'h-14', text: 'text-base', spacing: 'gap-2' };
    }
  };

  const dim = getDimensions();

  // Primary Brand Blue color is #0082D5
  const brandBlue = '#0082D5';

  const emblemSvg = (
    <svg 
      viewBox="0 0 400 400" 
      className="w-full h-full"
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 3 Skyscrapers */}
      {/* Left Tower */}
      <path d="M140,240 L140,140 L170,120 L170,240 Z" fill="white" />
      {/* Center Tower */}
      <path d="M185,240 L185,85 L215,60 L215,85 L215,240 Z" fill="white" />
      {/* Right Tower */}
      <path d="M230,240 L230,120 L260,140 L260,240 Z" fill="white" />
      
      {/* House Gable Roof & Base */}
      <path 
        d="M86,238 L200,185 L314,238 L300,242 L200,196 L100,242 Z" 
        fill="white" 
      />
      
      {/* Windows in Gable */}
      <rect x="187" y="210" width="10" height="10" fill="white" />
      <rect x="203" y="210" width="10" height="10" fill="white" />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div 
        className={`bg-[#0082D5] rounded-xl flex items-center justify-center shrink-0 p-1.5 shadow-md ${dim.width} ${dim.height} ${className}`}
      >
        {emblemSvg}
      </div>
    );
  }

  if (variant === 'white-text') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div 
          className={`bg-[#0082D5] rounded-xl flex items-center justify-center shrink-0 p-1 ${dim.width} ${dim.height}`}
        >
          {emblemSvg}
        </div>
        <div className="flex flex-col select-none">
          <span className="text-white font-black tracking-wider leading-none text-xl">SARA</span>
          <span className="text-white font-black tracking-wider leading-none text-xl mt-1">UYLAR</span>
        </div>
      </div>
    );
  }

  // Full rectangular branding logo
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        className="bg-[#0082D5] rounded-xl flex flex-col items-center justify-center shrink-0 p-2 shadow-lg shadow-blue-500/10"
        style={{ width: '64px', height: '64px' }}
      >
        <div className="w-10 h-10 -mb-1">
          {emblemSvg}
        </div>
        <div className="flex flex-col items-center -mt-0.5">
          <span className="text-[9px] text-white font-black tracking-widest leading-none">SARA</span>
          <span className="text-[9px] text-white font-black tracking-widest leading-none mt-0.5">UYLAR</span>
        </div>
      </div>
    </div>
  );
}
