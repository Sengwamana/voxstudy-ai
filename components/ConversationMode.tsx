import React from 'react';
import { useElevenLabsConversation } from '../hooks/useElevenLabsConversation';
import { StudyMode } from '../types';
import { MODE_CONFIGS } from '../constants';

interface ConversationModeProps {
  mode: StudyMode;
  agentId?: string;
  onExit: () => void;
}

export const ConversationMode: React.FC<ConversationModeProps> = ({ mode, agentId, onExit }) => {
  const {
    isConnected,
    isSpeaking,
    isListening,
    messages,
    status,
    startConversation,
    endConversation,
  } = useElevenLabsConversation({ mode, agentId });

  const handleToggle = async () => {
    if (isConnected) {
      await endConversation();
    } else {
      await startConversation();
    }
  };

  const getStatusText = () => {
    if (status === 'connecting') return 'Connecting...';
    if (isSpeaking) return 'VoxStudy is speaking...';
    if (isListening) return 'Listening...';
    if (isConnected) return 'Ready - Just speak!';
    return 'Tap to start conversation';
  };

  const getButtonColor = () => {
    if (isSpeaking) return 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/30'; 
    if (isListening) return 'bg-gradient-to-br from-red-500 to-red-700 shadow-xl shadow-red-500/30'; 
    if (isConnected) return 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-xl shadow-orange-500/30'; 
    return 'bg-gradient-to-br from-[#7C7974] to-[#6B6760] shadow-lg';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FAF9F6] relative h-[100dvh] overflow-hidden">
      {/* Background patterns for premium feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D97706] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#D97706] rounded-full blur-[120px]"></div>
      </div>
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div>
          <h1 className="text-xl font-semibold text-[#1A1915]">VoxStudy</h1>
          <span className="text-xs px-2 py-0.5 bg-[#FEF3C7] text-[#D97706] rounded-full">
            {MODE_CONFIGS[mode].label}
          </span>
        </div>
        <button
          onClick={onExit}
          className="px-4 py-2 text-sm font-medium border border-[#DEDBD4] rounded-lg text-[#6B6760] hover:bg-white bg-white/50 backdrop-blur-sm"
        >
          Exit
        </button>
      </div>

      {/* Main Conversation Button */}
      <div className="flex flex-col items-center gap-6 z-0 mb-20">
        <button
          onClick={handleToggle}
          disabled={status === 'connecting'}
          className={`w-36 h-36 md:w-48 md:h-48 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${getButtonColor()} ${
            isListening ? 'ring-4 ring-red-200 scale-105' : ''
          } ${isSpeaking ? 'ring-4 ring-emerald-200' : ''}`}
        >
          {status === 'connecting' ? (
            <svg className="w-12 h-12 md:w-16 md:h-16 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : isConnected ? (
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="text-white text-xs md:text-sm mt-2 font-medium">
                {isSpeaking ? 'Speaking' : isListening ? 'Listening' : 'Active'}
              </span>
            </div>
          ) : (
            <svg className="w-12 h-12 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        <p className="text-lg md:text-xl font-medium text-[#1A1915] text-center px-4">{getStatusText()}</p>
        
        {isConnected && (
          <p className="text-sm text-[#6B6760] text-center max-w-xs px-4">
            Have a natural conversation with VoxStudy. It will listen, respond, and help you learn.
          </p>
        )}
      </div>

      {/* Conversation Log - Fixed height and scrollable */}
      {messages.length > 0 && (
        <div className="absolute bottom-6 left-4 right-4 max-h-[35vh] overflow-y-auto bg-white/70 backdrop-blur-md border border-[#DEDBD4]/50 rounded-2xl p-5 shadow-xl z-10 scrollbar-hide space-y-3">
          {messages.slice(-8).map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-tr-none' 
                  : 'bg-white/90 text-[#1A1915] border border-[#DEDBD4]/30 rounded-tl-none font-medium'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationMode;
