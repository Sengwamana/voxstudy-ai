import React from 'react';
import { HistoryItem } from '../types';

interface HistoryListProps {
  history: HistoryItem[];
  onReplay: (audioUrl: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onReplay }) => {
  if (history.length === 0) {
    return (
      <div className="text-center mt-8 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
        <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-white shadow-sm mb-4">
            <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        </div>
        <p className="text-gray-500 font-medium text-sm md:text-base">No questions yet.</p>
        <p className="text-xs md:text-sm text-gray-400 mt-1">Tap the microphone to start learning.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-4 md:space-y-6">
      {history.map((item, index) => (
        <div 
            key={item.id} 
            className="bg-white/80 backdrop-blur-sm border border-[#DEDBD4]/60 rounded-2xl p-4 md:p-6 mb-4 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-orange-100 hover:-translate-y-1 fade-in-up"
            style={{ animationDelay: `${index * 80}ms` }}
        >
          {/* Question Section */}
          <div className="flex gap-3 md:gap-4">
            <div className="flex-shrink-0">
               <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
               </div>
            </div>
            <div className="flex-grow">
                <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">You Asked</p>
                <p className="text-gray-900 font-medium text-base md:text-lg leading-snug">{item.question}</p>
            </div>
          </div>
            
          {/* Divider */}
          <div className="h-px bg-gray-50 my-3 md:my-4 mx-2"></div>

          {/* Answer Section */}
          <div className="flex gap-3 md:gap-4">
             <div className="flex-shrink-0">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                     <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                     </svg>
                </div>
             </div>
             <div className="flex-grow">
                 <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <p className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider">Tutor Answered</p>
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-orange-100 flex items-center gap-1.5 shadow-sm">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        Tutor Mode
                    </span>
                 </div>
                 <p className="text-gray-700 text-sm md:text-base leading-relaxed">{item.answer}</p>
                 
                 {item.audioUrl && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button 
                      onClick={() => onReplay(item.audioUrl!)}
                      className="inline-flex items-center gap-2 text-xs md:text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 md:px-4 md:py-2 rounded-full"
                    >
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Replay Explanation
                    </button>
                    
                    <span className="text-[10px] md:text-xs text-[#6B6760] flex items-center gap-1.5 bg-[#F5F4EF] px-2 py-1 rounded border border-[#DEDBD4]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                        ElevenLabs AI
                    </span>
                  </div>
                )}
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};