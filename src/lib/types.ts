export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  status: 'sending' | 'sent' | 'error';
  streamingComplete?: boolean;
}

export interface Settings {
  apiKey?: string;
  theme: 'light' | 'dark' | 'system';
}