'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface ExploreModeContextType {
  isExploreMode: boolean;
  toggleExploreMode: () => void;
  setExploreMode: (value: boolean) => void;
}

const ExploreModeContext = createContext<ExploreModeContextType | undefined>(undefined);

export function ExploreModeProvider({ children }: { children: ReactNode }) {
  const [isExploreMode, setIsExploreMode] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('modaglimmora_exploremode');
      if (saved) {
        setIsExploreMode(saved === 'true');
      }
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('modaglimmora_exploremode', String(isExploreMode));
    }
  }, [isExploreMode]);

  const toggleExploreMode = useCallback(() => {
    setIsExploreMode(prev => !prev);
  }, []);

  const setExploreMode = useCallback((value: boolean) => {
    setIsExploreMode(value);
  }, []);

  return (
    <ExploreModeContext.Provider value={{ isExploreMode, toggleExploreMode, setExploreMode }}>
      {children}
    </ExploreModeContext.Provider>
  );
}

export function useExploreMode() {
  const context = useContext(ExploreModeContext);
  if (context === undefined) {
    throw new Error('useExploreMode must be used within an ExploreModeProvider');
  }
  return context;
}
