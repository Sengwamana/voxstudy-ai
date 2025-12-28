export type AppStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export type StudyMode = 'tutor' | 'quiz' | 'eli5';

export interface HistoryItem {
  id: string;
  question: string;
  answer: string;
  timestamp: number;
  audioUrl?: string;
}

export interface ApiConfig {
  elevenLabsVoiceId: string;
  studyMode: StudyMode;
}

export const DEFAULT_VOICE_ID = "y1adqrqs4jNaANXsIZnD"; // User provided voice