/**
 * Voice Input Types (SOW V10.2)
 *
 * Voice input and command types for speech recognition.
 */

// Voice Input State
export interface VoiceInput {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  interimTranscript: string;
  confidence: number;
  error?: string;
  language: string;
}

// Voice Command
export interface VoiceCommand {
  id: string;
  pattern: string[];
  action: 'search' | 'navigate' | 'filter' | 'add_to_cart' | 'ask_agi';
  parameters?: Record<string, string>;
}
