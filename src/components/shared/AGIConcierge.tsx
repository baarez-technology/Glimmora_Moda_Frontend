'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, X, Send, Sparkles, Calendar } from 'lucide-react';
import { mockCalendarEvents } from '@/data/mock-data';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  hasCalendarLink?: boolean;
}

// Get the next upcoming event
const getNextEvent = () => {
  const today = new Date();
  return mockCalendarEvents.find(event => new Date(event.date) >= today);
};

const nextEvent = getNextEvent();

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: nextEvent
      ? `Welcome to ModaGlimmora. I noticed you have "${nextEvent.title}" coming up on ${new Date(nextEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. I've prepared outfit suggestions for you. How may I assist you today?`
      : 'Welcome to ModaGlimmora. I\'m your Fashion Intelligence guide. How may I assist you in discovering something exceptional today?',
    hasCalendarLink: !!nextEvent
  }
];

const suggestions = [
  'What should I wear to my next event?',
  'Show me evening bags',
  'Tell me about Dior heritage',
  'Help me complete an outfit'
];

export default function AGIConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages([...messages, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, { content: string; hasCalendarLink?: boolean }> = {
        'event': {
          content: nextEvent
            ? `For your upcoming "${nextEvent.title}", I've curated outfit suggestions based on the ${nextEvent.dressCode || 'smart'} dress code and the venue. You can view all my recommendations in your Style Calendar. I suggest starting with pieces that express sophistication while remaining comfortable for the occasion.`
            : 'I\'d be happy to help you prepare for an event. Connect your calendar in settings and I\'ll provide personalized outfit suggestions for all your upcoming occasions.',
          hasCalendarLink: !!nextEvent
        },
        'wear': {
          content: nextEvent
            ? `Based on your "${nextEvent.title}" event, I recommend an ensemble that balances elegance with the ${nextEvent.eventType.replace('_', ' ')} atmosphere. Check your Style Calendar for detailed suggestions including items from your wardrobe and complementary new pieces.`
            : 'Tell me more about the occasion and I can suggest appropriate pieces from our collections.',
          hasCalendarLink: !!nextEvent
        },
        'calendar': {
          content: 'Your Style Calendar syncs with your personal calendar to provide outfit suggestions for upcoming events. I analyze the event type, venue, weather, and your Fashion Identity to curate perfect looks.',
          hasCalendarLink: true
        },
        'evening': {
          content: 'For evening occasions, I would suggest exploring our Lady Dior collection. The small size in black leather is particularly elegant for gallery openings and dinner events. Would you like me to show you the story behind this iconic piece?',
        },
        'gallery': {
          content: 'A gallery opening calls for understated elegance. Based on your interest, I recommend pieces that balance artistic expression with sophistication. The Dior Bar Jacket paired with statement accessories would create a memorable impression.',
        },
        'dior': {
          content: 'Dior\'s heritage is one of revolutionary elegance. Founded in 1946 by Christian Dior, the house introduced the "New Look" that transformed post-war fashion. Would you like to explore our heritage stories or see iconic pieces?',
        },
        'outfit': {
          content: nextEvent
            ? `I\'d love to help! For your upcoming "${nextEvent.title}", I\'ve already prepared suggestions in your Style Calendar. Would you like to see them, or are you looking for something specific?`
            : 'I\'d be happy to help you complete an outfit. Could you tell me more about the occasion and any pieces you already have in mind?',
          hasCalendarLink: !!nextEvent
        }
      };

      const responseKey = Object.keys(responses).find(key =>
        input.toLowerCase().includes(key)
      );

      const response = responseKey ? responses[responseKey] : {
        content: 'I understand you\'re looking for something special. Let me help you explore our curated collections. You might enjoy starting with our Brand Universes to discover pieces that resonate with your style.'
      };

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        hasCalendarLink: response.hasCalendarLink
      };

      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
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
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-xl overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-charcoal-deep to-sapphire-deep p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-muted/20 flex items-center justify-center">
                <Sparkles size={20} className="text-gold-soft" />
              </div>
              <div>
                <h3 className="text-ivory-cream font-display text-lg">Fashion Intelligence</h3>
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
                  <p className="text-sm leading-relaxed">{message.content}</p>
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
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2.5 bg-parchment border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gold-muted/50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
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
