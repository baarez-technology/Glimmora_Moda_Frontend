/**
 * AGI Types
 *
 * AGI conversation and suggestion types, plus navigation.
 */

// AGI Suggestion
export interface AGISuggestion {
  type: 'product' | 'story' | 'collection' | 'action';
  title: string;
  description: string;
  link?: string;
  productId?: string;
}

// AGI Message
export interface AGIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: AGISuggestion[];
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}
