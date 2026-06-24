'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { MessageCircle, X, Send, Sparkles, Calendar } from 'lucide-react';
import * as calendarService from '@/services/calendar.service';
import * as conversationService from '@/services/conversation.service';
import VoiceInput from '@/components/shared/VoiceInput';
import type { CalendarEvent } from '@/types';
import type { WsSession } from '@/services/conversation.service';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  hasCalendarLink?: boolean;
  citations?: string[];
  isStreaming?: boolean;
}

// Set to true once nginx proxies WebSocket upgrades. While false, all
// messages go via the REST fallback (POST /{id}/messages) which works
// through the Next.js /api/v1/* rewrite without any WS upgrade support.
const USE_WEBSOCKET = false;

const defaultInitialMessage: Message = {
  id: '1',
  role: 'assistant',
  content: 'Welcome to ModaGlimmora. I\'m your Fashion Intelligence guide. How may I assist you in discovering something exceptional today?',
  hasCalendarLink: false
};

const suggestions = [
  'What should I wear to my next event?',
  'Show me evening bags',
  'Tell me about Dior heritage',
  'Help me complete an outfit'
];

export default function AGIConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([defaultInitialMessage]);
  const [input, setInput] = useState('');
  const [nextEvent, setNextEvent] = useState<CalendarEvent | null>(null);
  const [isSending, setIsSending] = useState(false);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Backend conversation state
  const conversationIdRef = useRef<string | null>(null);
  const wsSessionRef = useRef<WsSession | null>(null);
  const streamingMsgIdRef = useRef<string | null>(null);

  // ESC key handler for chat panel
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen) chatInputRef.current?.focus();
  }, [isOpen]);

  // Close WS on unmount
  useEffect(() => {
    return () => {
      wsSessionRef.current?.close();
    };
  }, []);

  // Load calendar events from service on mount
  useEffect(() => {
    calendarService.getCalendarEvents(false).then((backendEvents) => {
      const events = backendEvents.map(calendarService.mapBackendToFrontendEvent);
      const today = new Date();
      const upcoming = events.find(event => new Date(event.date) >= today);
      if (upcoming) {
        setNextEvent(upcoming);
        setMessages([{
          id: '1',
          role: 'assistant',
          content: `Welcome to ModaGlimmora. I noticed you have "${upcoming.title}" coming up on ${new Date(upcoming.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. I've prepared outfit suggestions for you. How may I assist you today?`,
          hasCalendarLink: true
        }]);
      }
    }).catch(() => {
      // Calendar not connected — use default message
    });
  }, []);

  /**
   * Ensure a conversation exists on the backend and a WebSocket is open.
   * Returns the conversation ID, or null if the user is not authenticated.
   */
  const ensureConversation = useCallback(async (): Promise<string | null> => {
    const token = conversationService.getUserToken();
    if (!token) return null;

    // Reuse existing conversation if available
    if (conversationIdRef.current && (!USE_WEBSOCKET || wsSessionRef.current)) {
      return conversationIdRef.current;
    }

    // Create conversation via REST
    let conversationId = conversationIdRef.current;
    if (!conversationId) {
      try {
        const convo = await conversationService.createConversation();
        conversationId = convo.conversation_id;
        conversationIdRef.current = conversationId;
      } catch {
        return null;
      }
    }

    // Open WebSocket for streaming (only when USE_WEBSOCKET is enabled)
    if (USE_WEBSOCKET && !wsSessionRef.current) {
      wsSessionRef.current = conversationService.connectWebSocket(
        conversationId,
        token,
        {
          onToken: (delta) => {
            const msgId = streamingMsgIdRef.current;
            if (!msgId) return;
            setMessages(prev =>
              prev.map(m =>
                m.id === msgId
                  ? { ...m, content: m.content + delta }
                  : m
              )
            );
          },
          onMessageDone: () => {
            const msgId = streamingMsgIdRef.current;
            if (msgId) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === msgId ? { ...m, isStreaming: false } : m
                )
              );
            }
            streamingMsgIdRef.current = null;
            setIsSending(false);
          },
          onCitations: (citations) => {
            const msgId = streamingMsgIdRef.current;
            if (msgId) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === msgId ? { ...m, citations } : m
                )
              );
            }
          },
          onError: (detail) => {
            streamingMsgIdRef.current = null;
            setIsSending(false);
            setMessages(prev => {
              // Replace any in-progress streaming message with the error
              const hasStreaming = prev.some(m => m.isStreaming);
              if (hasStreaming) {
                return prev.map(m =>
                  m.isStreaming
                    ? { ...m, content: 'I\'m having trouble connecting right now. Please try again in a moment.', isStreaming: false }
                    : m
                );
              }
              return [
                ...prev,
                {
                  id: (Date.now() + 2).toString(),
                  role: 'assistant',
                  content: 'I\'m having trouble connecting right now. Please try again in a moment.',
                },
              ];
            });
          },
          onClose: () => {
            // Socket closed — clear session so the next message re-opens it
            wsSessionRef.current = null;
            streamingMsgIdRef.current = null;
            setIsSending(false);
          },
        },
      );
    }

    return conversationId;
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    // Placeholder streaming message
    const streamingId = (Date.now() + 1).toString();
    const streamingMsg: Message = {
      id: streamingId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };
    setMessages(prev => [...prev, streamingMsg]);
    streamingMsgIdRef.current = streamingId;

    const token = conversationService.getUserToken();

    if (!token) {
      // Not authenticated — fall through to REST-less graceful error
      setMessages(prev =>
        prev.map(m =>
          m.id === streamingId
            ? { ...m, content: 'Please sign in to use the AI Concierge.', isStreaming: false }
            : m
        )
      );
      streamingMsgIdRef.current = null;
      setIsSending(false);
      return;
    }

    const conversationId = await ensureConversation();

    if (!conversationId) {
      // Could not create conversation — fall back to REST direct attempt
      // or show error
      setMessages(prev =>
        prev.map(m =>
          m.id === streamingId
            ? { ...m, content: 'Unable to start a conversation. Please try again.', isStreaming: false }
            : m
        )
      );
      streamingMsgIdRef.current = null;
      setIsSending(false);
      return;
    }

    // Try WebSocket first (only when USE_WEBSOCKET is enabled and socket is open)
    if (USE_WEBSOCKET && wsSessionRef.current) {
      wsSessionRef.current.sendMessage(trimmed);
      // Response arrives via WS callbacks above
      return;
    }

    // WebSocket disabled or unavailable — use REST
    try {
      const result = await conversationService.sendMessageRest(conversationId, trimmed);
      setMessages(prev =>
        prev.map(m =>
          m.id === streamingId
            ? {
                ...m,
                content: result.content,
                citations: result.citations?.length ? result.citations : undefined,
                isStreaming: false,
              }
            : m
        )
      );
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === streamingId
            ? { ...m, content: 'I\'m having trouble connecting right now. Please try again in a moment.', isStreaming: false }
            : m
        )
      );
    } finally {
      streamingMsgIdRef.current = null;
      setIsSending(false);
    }
  }, [input, isSending, ensureConversation]);

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleVoiceInput = (transcript: string) => {
    setInput(transcript);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-charcoal-deep text-ivory-cream'
            : 'bg-gold-muted text-noir hover:bg-gold-deep'
        }`}
        aria-label="Toggle AI Concierge"
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-xl overflow-hidden animate-slide-up" role="dialog" aria-modal="false" aria-labelledby="concierge-panel-title">
          {/* Header */}
          <div className="bg-gradient-to-r from-charcoal-deep to-sapphire-deep p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-muted/20 flex items-center justify-center">
                <Sparkles size={20} className="text-gold-soft" />
              </div>
              <div>
                <h3 id="concierge-panel-title" className="text-ivory-cream font-display text-lg">Fashion Intelligence</h3>
                <p className="text-xs text-taupe">Your personal style guide</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[320px] overflow-y-auto p-4 space-y-4 bg-ivory-cream">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-charcoal-deep text-ivory-cream rounded-br-sm'
                      : 'bg-white text-charcoal-deep rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-gold-muted animate-pulse rounded-sm align-middle" aria-hidden="true" />
                    )}
                  </p>
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.citations.map((citation, i) => (
                        <p key={i} className="text-xs text-stone/70 italic">{citation}</p>
                      ))}
                    </div>
                  )}
                  {message.hasCalendarLink && message.role === 'assistant' && (
                    <Link
                      href="/calendar"
                      className="mt-2 flex items-center gap-2 text-xs text-gold-muted hover:text-gold-deep transition-colors"
                    >
                      <Calendar size={14} />
                      View Style Calendar
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-parchment border-t border-sand/30">
              <p className="text-xs text-stone mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestion(suggestion)}
                    className="text-xs px-3 py-1.5 bg-white text-charcoal-warm rounded-full hover:bg-sand/30 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-sand/30">
            <div className="flex items-center gap-2">
              <input
                ref={chatInputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2.5 bg-parchment border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gold-muted/50"
                disabled={isSending}
              />
              <VoiceInput onTranscript={handleVoiceInput} className="scale-90" />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="w-10 h-10 rounded-full bg-charcoal-deep text-ivory-cream flex items-center justify-center hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
