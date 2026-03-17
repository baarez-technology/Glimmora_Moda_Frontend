'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Crown, Send, MessageCircle, Sparkles, Info } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface Message {
  id: string;
  sender: 'user' | 'agi';
  content: string;
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: 'msg-1',
    sender: 'agi',
    content: 'Welcome to your Fashion Concierge. I can help you discover styles, plan outfits for occasions, explore collections from our partner brands, and offer wardrobe suggestions tailored to your preferences. Every recommendation I make is explainable and reversible.',
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'msg-2',
    sender: 'user',
    content: 'What would you recommend for a charity gala next month?',
    timestamp: new Date(Date.now() - 90000).toISOString(),
  },
  {
    id: 'msg-3',
    sender: 'agi',
    content: 'For a charity gala, I would suggest a black-tie ensemble that balances formality with personal distinction. Based on your style profile, I recommend considering a midnight navy tuxedo from our Valentino collection — it offers sophistication without blending into the standard black. I chose this because your wardrobe history shows a preference for deep jewel tones, and navy pairs beautifully with the gold cufflinks you purchased last season. Would you like me to explore accessory pairings as well?',
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
];

const suggestedPrompts = [
  'What should I wear to a business dinner?',
  'Find me a summer collection from Italian brands',
  'Complete my look with this blazer',
  "What's trending in Parisian fashion?",
];

export default function ConversationalCommercePage() {
  const { showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const content = text || inputValue.trim();
    if (!content) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Show coming-soon notice
    setTimeout(() => {
      const systemMessage: Message = {
        id: `msg-${Date.now()}-reply`,
        sender: 'agi',
        content: 'Coming soon — this feature requires the Conversational Commerce API. Your message has been logged and will be available when the service launches. In the meantime, your concierge can assist with any fashion inquiries.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, systemMessage]);
      showToast('Conversational Commerce API not yet connected', 'info');
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/uhni"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 mb-4">
              <Crown size={16} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                UHNI Exclusive
              </span>
            </div>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Fashion Concierge
            </h1>
            <p className="text-sand mt-3">Natural language fashion intelligence</p>
          </div>
        </div>
      </div>

      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Info Banner */}
        <div className="bg-parchment p-6 border border-sand mb-8">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-charcoal-deep flex items-center justify-center flex-shrink-0">
              <Info size={14} className="text-ivory-cream" />
            </div>
            <div>
              <p className="font-medium text-charcoal-deep mb-1">Conversational Commerce</p>
              <p className="text-sm text-stone">
                Natural language replaces search, filters, and catalog navigation. All recommendations
                are explainable, reversible, and logged for your review.
              </p>
            </div>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="mb-6">
          <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-3">
            <Sparkles size={12} className="inline mr-1.5" />
            Suggested prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputValue(prompt);
                }}
                className="px-4 py-2 bg-white border border-sand text-sm text-charcoal-deep hover:border-charcoal-deep hover:bg-parchment transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white border border-sand/50">
          {/* Chat Header */}
          <div className="p-6 border-b border-sand">
            <h3 className="font-display text-xl text-charcoal-deep flex items-center gap-3">
              <MessageCircle size={20} className="text-stone" />
              Fashion Intelligence
            </h3>
            <p className="text-xs text-taupe mt-1">
              All conversations are logged and recommendations are fully traceable
            </p>
          </div>

          {/* Messages Area */}
          <div className="h-[480px] overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${
                  message.sender === 'user'
                    ? 'bg-charcoal-deep text-ivory-cream'
                    : 'bg-parchment text-charcoal-deep'
                } p-4`}>
                  {message.sender === 'agi' && (
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                      Fashion Concierge
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-[10px] mt-2 ${
                    message.sender === 'user' ? 'text-ivory-cream/50' : 'text-taupe'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-sand">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about styles, occasions, wardrobe suggestions..."
                className="flex-1 px-4 py-3 bg-parchment border-0 text-charcoal-deep placeholder:text-taupe focus:outline-none focus:ring-1 focus:ring-charcoal-deep"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
