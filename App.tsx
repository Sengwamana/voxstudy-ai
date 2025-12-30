import React, { useState, useEffect, useRef } from 'react';
import { MicrophoneButton } from './components/MicrophoneButton';
import { HistoryList } from './components/HistoryList';
import { SettingsModal } from './components/SettingsModal';
import { ConversationMode } from './components/ConversationMode';
import { AppStatus, HistoryItem, ApiConfig, DEFAULT_VOICE_ID } from './types';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { generateTutorResponse } from './services/geminiService';
import { generateSpeech } from './services/elevenLabsService';
import { MODE_CONFIGS, SUGGESTED_PROMPTS_BY_MODE } from './constants';

const HISTORY_STORAGE_KEY = 'voxstudy_history';

const App: React.FC = () => {
  // Config State
  const [config, setConfig] = useState<ApiConfig & { elevenLabsAgentId?: string }>({
    elevenLabsVoiceId: DEFAULT_VOICE_ID,
    studyMode: 'tutor'
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isConversationMode, setIsConversationMode] = useState(false);

  // Fetch dynamic config from backend on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const data = await response.json();
          setConfig(prev => ({
            ...prev,
            elevenLabsVoiceId: data.elevenLabsVoiceId || prev.elevenLabsVoiceId,
            elevenLabsAgentId: data.elevenLabsAgentId
          }));
        }
      } catch (err) {
        console.warn("Failed to fetch backend config, using defaults", err);
      }
    };
    fetchConfig();
  }, []);

  // App State
  const [status, setStatus] = useState<AppStatus>('idle');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Hooks
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript,
    hasRecognitionSupport,
    mediaStream
  } = useSpeechRecognition();

  // Load history from local storage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  // Handle Speech End
  useEffect(() => {
    if (!isListening && status === 'listening') {
      if (transcript.trim().length > 0) {
        handleProcessing(transcript);
      } else {
        setStatus('idle');
        setErrorMessage("I didn't hear anything. Please try again.");
        setTimeout(() => setErrorMessage(null), 3000);
      }
    }
  }, [isListening, transcript, status]);

  const handleProcessing = async (text: string) => {
    if (status === 'processing') return; 
    
    // Create cancellable controller for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus('processing');
    setErrorMessage(null);

    try {
      // 1. Get Answer from Backend
      const answer = await generateTutorResponse(text, history, config.studyMode, controller.signal);

      // 2. Try Get Audio from Backend, fallback to Browser TTS
      let audioUrl: string | undefined;
      
      if (voiceEnabled) {
        try {
           // We don't pass signal to TTS yet, but we check if aborted before proceeding
           if (controller.signal.aborted) throw new Error("Aborted");
           audioUrl = await generateSpeech('server-handled', config.elevenLabsVoiceId, answer);
        } catch (ttsError: any) {
          if (ttsError.message !== "Aborted") {
            if (ttsError.code === "QUOTA_EXCEEDED") {
                console.warn("ElevenLabs Quota Exceeded. Switching to browser TTS.");
                setErrorMessage("Daily voice limit reached. Using basic voice.");
                setTimeout(() => setErrorMessage(null), 4000);
            } else {
                console.warn("Server TTS failed, falling back to browser TTS:", ttsError.message);
            }
          }
        }
      }

      if (controller.signal.aborted) return;

      // 3. Update History
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        question: text,
        answer: answer,
        timestamp: Date.now(),
        audioUrl: audioUrl
      };

      setHistory(prev => [newItem, ...prev].slice(0, 10)); 
      
      // 4. Play Audio
      if (voiceEnabled) {
        if (audioUrl) {
          playAudio(audioUrl);
        } else {
          speakWithBrowser(answer);
        }
      } else {
        setStatus('idle');
      }

    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'Aborted') {
        console.log("Request cancelled by user");
        setStatus('idle');
        return;
      }
      console.error("Processing Error:", err);
      setStatus('error');
      setErrorMessage(err.message || "Something went wrong.");
      setTimeout(() => setStatus('idle'), 5000);
    } finally {
        abortControllerRef.current = null;
    }
  };

  const handlePromptClick = (text: string) => {
    if (status === 'idle') {
      handleProcessing(text);
    }
  };

  const playAudio = (url: string) => {
    setStatus('speaking');
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play().catch(e => {
        console.error("Playback failed:", e);
        setStatus('idle');
      });
      audioRef.current.onended = () => setStatus('idle');
      audioRef.current.onerror = () => setStatus('idle');
    }
  };

  const speakWithBrowser = (text: string) => {
    if (!('speechSynthesis' in window)) {
        setStatus('idle');
        return;
    }

    setStatus('speaking');
    window.speechSynthesis.cancel(); 

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setStatus('idle');
    utterance.onerror = (e) => {
        console.error("Browser TTS error", e);
        setStatus('idle');
    };
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en') && v.name.includes('Google')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  };

  const handleMicClick = () => {
    if (status === 'idle' || status === 'error') {
      // Start Listening
      setStatus('listening');
      resetTranscript();
      startListening();
    } else if (status === 'listening') {
      // Stop Listening (Trigger processing)
      stopListening();
    } else if (status === 'speaking') {
      // Stop Speaking
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setStatus('idle');
    } else if (status === 'processing') {
      // CANCEL Processing
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setStatus('idle');
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  };

  const getStatusText = () => {
    switch (status) {
      case 'idle': return "Tap to Ask";
      case 'listening': return "Listening...";
      case 'processing': return "Thinking... (Tap to Cancel)";
      case 'speaking': return "Speaking... (Tap to Stop)";
      case 'error': return "Error";
      default: return "Ready";
    }
  };

  const getStatusIcon = () => {
    switch(status) {
      case 'listening': return "🎤";
      case 'processing': return "⏹️";
      case 'speaking': return "🤫";
      default: return "";
    }
  };

  const currentPrompts = SUGGESTED_PROMPTS_BY_MODE[config.studyMode] || SUGGESTED_PROMPTS_BY_MODE.tutor;

  // Render Conversation Mode if active
  if (isConversationMode) {
    return (
      <ConversationMode 
        mode={config.studyMode} 
        agentId={config.elevenLabsAgentId}
        onExit={() => setIsConversationMode(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col py-4 md:py-8 px-4 relative overflow-hidden">
      <audio ref={audioRef} className="hidden" />
      
      {/* Clean Background - No blobs for Claude aesthetic */}
      <div className="fixed inset-0 bg-[#FAF9F6] -z-20"></div>

      {/* Header */}
      <header className="w-full max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 relative z-10 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-semibold text-[#1A1915] tracking-tight">VoxStudy</h1>
          <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
             <p className="text-[#6B6760] text-sm">Voice-first study companion</p>
             <span className="text-xs px-2.5 py-0.5 bg-[#FEF3C7] text-[#D97706] rounded-full font-medium border border-[#FCD34D]">
                {MODE_CONFIGS[config.studyMode].label}
             </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-center">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2.5 bg-white border border-[#DEDBD4] rounded-xl shadow-sm text-[#6B6760] hover:text-[#D97706] hover:border-[#D97706] transition-all duration-200"
          title="Settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826 3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        
        {/* Conversation Mode Toggle */}
        <button 
          onClick={() => setIsConversationMode(true)}
          className="px-4 py-2 bg-[#D97706] text-white text-sm font-medium rounded-lg hover:bg-[#B45309] transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
          title="Start Conversation Mode"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Voice Mode
        </button>
        </div>
      </header>
      
      {/* Scrollable Content Container */}
      <div className="flex-1 w-full max-w-2xl mx-auto relative z-10 pb-40 px-2 md:px-0 scrollbar-hide">
        {!hasRecognitionSupport && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl mb-6 max-w-lg mx-auto text-center shadow-sm relative z-10 text-sm md:text-base">
            Warning: Your browser does not support the Web Speech API. Please use Chrome, Edge, or Safari.
          </div>
        )}

        {/* Main Control Area */}
        <div className="flex flex-col items-center gap-6 mb-8 relative z-10 w-full max-w-xl mx-auto">
          <div className="relative">
             <MicrophoneButton 
               status={status} 
               onClick={handleMicClick} 
               disabled={!hasRecognitionSupport} 
               mediaStream={mediaStream}
             />
          </div>
          
          {/* Status Text Area */}
          <div className="text-center w-full flex flex-col items-center justify-start pb-4">
            <div className="flex items-center gap-2 justify-center">
              <span className="text-xl md:text-2xl">{getStatusIcon()}</span>
              <p className={`text-xl md:text-2xl font-bold transition-all duration-300 ${status === 'error' ? 'text-red-500' : 'text-gray-800'} ${status === 'listening' || status === 'processing' ? 'animate-pulse' : ''}`}>
                {getStatusText()}
              </p>
            </div>
            
            {errorMessage && (
              <p className="text-sm text-red-500 mt-2 font-medium bg-red-50 px-3 py-1 rounded-full animate-bounce">{errorMessage}</p>
            )}
            
            {status === 'listening' && transcript && (
              <div className="mt-4 px-4 py-3 bg-white border border-[#DEDBD4] rounded-xl shadow-sm max-w-xl w-full fade-in-up mx-auto">
                <p className="text-[#1A1915] text-base md:text-lg font-medium leading-relaxed text-center">
                  "{transcript}"
                </p>
              </div>
            )}
          </div>

          {/* Suggested Prompts */}
          {status === 'idle' && (
             <div className="flex flex-wrap gap-2.5 justify-center mt-2 px-4 w-full">
               {currentPrompts.map((prompt) => (
                 <button
                   key={prompt}
                   onClick={() => handlePromptClick(prompt)}
                   className="px-3 py-2 text-xs md:text-sm font-medium bg-white border border-[#DEDBD4] rounded-lg text-[#1A1915] hover:border-[#D97706] hover:text-[#D97706] transition-all duration-200 active:scale-95 shadow-sm"
                 >
                   {prompt}
                 </button>
               ))}
             </div>
           )}
        </div>

        {/* History Section */}
        <div className="relative z-10 w-full flex flex-col items-center flex-grow">
            {history.length > 0 && (
              <div className="flex items-center gap-2 mb-4 text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50 px-3 py-1 rounded-full border border-gray-100">
                 <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                 {config.studyMode === 'quiz' ? 'Context Active (Quiz)' : 'Context Active'}
              </div>
            )}
            <HistoryList 
              history={history} 
              onReplay={(url) => {
                  if(url && voiceEnabled) playAudio(url);
              }} 
            />
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={(newConfig) => {
           setConfig(newConfig);
           window.localStorage.setItem('voxstudy_config', JSON.stringify(newConfig));
        }}
        initialConfig={config}
        voiceEnabled={voiceEnabled}
        onVoiceToggle={setVoiceEnabled}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
};

export default App;