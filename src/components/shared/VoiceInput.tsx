'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, AlertCircle, X } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  className?: string;
}

export default function VoiceInput({
  onTranscript,
  onListeningChange,
  className = ''
}: VoiceInputProps) {
  const [showError, setShowError] = useState(false);

  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    onResult: (text) => {
      onTranscript(text);
    },
    onError: () => {
      setShowError(true);
    }
  });

  // Notify parent of listening state changes
  useEffect(() => {
    if (onListeningChange) {
      onListeningChange(isListening);
    }
  }, [isListening, onListeningChange]);

  // Auto-dismiss error
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  if (!isSupported) {
    return (
      <button
        disabled
        className={`p-3 bg-stone/10 text-stone/40 rounded-full cursor-not-allowed ${className}`}
        title="Voice input not supported in this browser"
      >
        <MicOff className="w-5 h-5" />
      </button>
    );
  }

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main button */}
      <motion.button
        onClick={handleToggle}
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        className={`relative p-3 rounded-full transition-colors ${
          isListening
            ? 'bg-red-500 text-white'
            : 'bg-gold-soft/10 text-gold-soft hover:bg-gold-soft/20'
        }`}
        whileTap={{ scale: 0.95 }}
        animate={isListening ? { scale: [1, 1.05, 1] } : {}}
        transition={isListening ? { repeat: Infinity, duration: 1 } : {}}
      >
        {isListening ? (
          <Mic className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}

        {/* Listening indicator rings */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                className="absolute inset-0 border-2 border-red-500 rounded-full"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              <motion.div
                className="absolute inset-0 border-2 border-red-500 rounded-full"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.3 }}
              />
            </>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Transcript preview */}
      <AnimatePresence>
        {isListening && (transcript || interimTranscript) && (
          <motion.div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 max-w-[80vw]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="bg-charcoal-deep text-ivory-cream rounded-lg p-3 text-sm shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-ivory-cream/60">Listening...</span>
              </div>
              <p className="text-sm">
                {transcript}
                <span className="text-ivory-cream/50">{interimTranscript}</span>
              </p>
            </div>
            {/* Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-charcoal-deep rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {showError && error && (
          <motion.div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 max-w-[90vw]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 shadow-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs flex-1">{error}</p>
                <button
                  onClick={() => setShowError(false)}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Inline voice input for chat interfaces
 */
export function VoiceInputInline({
  onTranscript,
  placeholder = "Speak your message...",
  className = ''
}: {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    onResult: (text) => {
      onTranscript(text);
    }
  });

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.button
        onClick={() => isListening ? stopListening() : startListening()}
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        className={`p-2 rounded-full transition-colors ${
          isListening ? 'bg-red-500 text-white' : 'bg-stone/10 text-stone/60 hover:bg-stone/20'
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <Mic className="w-4 h-4" />
      </motion.button>

      {isListening && (
        <motion.div
          className="flex-1 text-sm text-stone/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {transcript || interimTranscript || placeholder}
        </motion.div>
      )}
    </div>
  );
}
