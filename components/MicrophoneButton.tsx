import React from 'react';
import { AppStatus } from '../types';
import { AudioVisualizer } from './AudioVisualizer';

interface MicrophoneButtonProps {
  status: AppStatus;
  onClick: () => void;
  disabled?: boolean;
  mediaStream?: MediaStream | null;
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({ status, onClick, disabled, mediaStream }) => {
  const getButtonStyles = () => {
    switch (status) {
      case 'listening':
        return 'bg-[#DC2626] shadow-lg shadow-red-500/30 ring-4 ring-red-200 scale-105';
      case 'processing':
        return 'bg-[#6B6760] cursor-wait animate-pulse shadow-lg ring-2 ring-[#DEDBD4]';
      case 'speaking':
        return 'bg-[#059669] hover:opacity-90 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-200';
      case 'idle':
      case 'error':
      default:
        return 'bg-[#D97706] shadow-xl shadow-orange-500/30 ring-2 ring-transparent hover:ring-orange-200 hover:scale-105 hover:-translate-y-0.5';
    }
  };

  const getIcon = () => {
    if (status === 'processing') {
      return (
        <svg className="w-14 h-14 text-white animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    }
    if (status === 'listening') {
      return (
        <svg className="w-12 h-12 text-white relative z-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
        </svg>
      );
    }
    if (status === 'speaking') {
         return (
            <div className="flex gap-1 items-end h-8">
                <div className="w-1.5 bg-white h-4 animate-[bounce_1s_infinite]"></div>
                <div className="w-1.5 bg-white h-8 animate-[bounce_1.2s_infinite]"></div>
                <div className="w-1.5 bg-white h-6 animate-[bounce_0.8s_infinite]"></div>
            </div>
         )
    }
    // Idle icon
    return (
      <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    );
  };

  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      {/* Visualizer Container */}
      {status === 'listening' && mediaStream && (
         <AudioVisualizer stream={mediaStream} />
      )}

      {/* Ripple Effect (Fallback or Supplemental) */}
      {status === 'listening' && !mediaStream && (
        <>
            <div className="absolute inset-0 rounded-full border border-red-400 opacity-50 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        </>
      )}
      
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 z-10 relative ${getButtonStyles()}`}
        aria-label={status === 'listening' ? 'Stop listening' : 'Start listening'}
      >
        {getIcon()}
      </button>
    </div>
  );
};