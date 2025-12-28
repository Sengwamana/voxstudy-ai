import { useCallback, useState, useRef, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { StudyMode } from '../types';
import { MODE_CONFIGS } from '../constants';

interface UseElevenLabsConversationOptions {
  agentId?: string;
  mode?: StudyMode;
  onMessage?: (message: { role: string; content: string }) => void;
  onError?: (error: Error) => void;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const useElevenLabsConversation = (options: UseElevenLabsConversationOptions = {}) => {
  const { mode = 'tutor', onMessage, onError } = options;
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Use ElevenLabs conversation hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('[ElevenLabs] Connected');
      setIsConnected(true);
    },
    onDisconnect: () => {
      console.log('[ElevenLabs] Disconnected');
      setIsConnected(false);
      setIsSpeaking(false);
      setIsListening(false);
    },
    onMessage: (message) => {
      console.log('[ElevenLabs] Message:', message);
      const newMessage: ConversationMessage = {
        role: message.source === 'user' ? 'user' : 'assistant',
        content: message.message,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, newMessage]);
      onMessage?.(newMessage);
    },
    onError: (error) => {
      console.error('[ElevenLabs] Error:', error);
      onError?.(new Error(String(error)));
    },
    onModeChange: ({ mode: convMode }) => {
      console.log('[ElevenLabs] Mode:', convMode);
      setIsSpeaking(convMode === 'speaking');
      setIsListening(convMode === 'listening');
    },
  });

  // Start conversation with the VoxStudy agent
  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start the ElevenLabs conversation
      // Note: You'll need to create an Agent in ElevenLabs dashboard
      // and use the agent ID here. For now, we use a signed URL approach.
      await conversation.startSession({
        agentId: options.agentId || process.env.ELEVENLABS_AGENT_ID,
        overrides: {
          agent: {
            firstMessage: `Hello! I'm VoxStudy, your ${MODE_CONFIGS[mode].label}. How can I help you learn today?`,
            prompt: {
              prompt: MODE_CONFIGS[mode].instruction,
            }
          }
        }
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      onError?.(error as Error);
    }
  }, [conversation, mode, options.agentId, onError]);

  // End conversation
  const endConversation = useCallback(async () => {
    await conversation.endSession();
    setMessages([]);
  }, [conversation]);

  // Get conversation status
  const status = conversation.status;

  return {
    // State
    isConnected,
    isSpeaking,
    isListening,
    messages,
    status,
    
    // Actions
    startConversation,
    endConversation,
    
    // Volume level for visualizations
    isMuted: conversation.isSpeaking ? false : true,
  };
};

export default useElevenLabsConversation;
