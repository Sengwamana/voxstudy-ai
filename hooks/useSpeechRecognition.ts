import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
  resetTranscript: () => void;
  mediaStream: MediaStream | null;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<number | null>(null);
  // Track final transcript separately to handle continuous updates
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setHasRecognitionSupport(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      // Continuous true allows for pauses without cutting off
      recognitionRef.current.continuous = true; 
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalChunk) {
            finalTranscriptRef.current += ' ' + finalChunk;
        }

        const currentDisplay = (finalTranscriptRef.current + ' ' + interimTranscript).trim();
        setTranscript(currentDisplay);

        // Silence Detection: Reset timer on every result
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        
        // Only set silence timer if we have some text
        if (currentDisplay.length > 0) {
            silenceTimerRef.current = window.setTimeout(() => {
                stopListening();
            }, 2000); // 2 seconds of silence triggers submit
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== 'no-speech') {
             stopListening();
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  const startListening = useCallback(async () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      finalTranscriptRef.current = '';
      
      try {
        // Request Mic Access for Visualizer
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMediaStream(stream);

        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start recognition or mic", e);
        setIsListening(false);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      // isListening set to false in onend
    }
  }, [isListening]);

  // Clean up stream when listening stops
  useEffect(() => {
    if (!isListening && mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
    }
  }, [isListening, mediaStream]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    finalTranscriptRef.current = '';
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
    resetTranscript,
    mediaStream
  };
};