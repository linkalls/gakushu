'use client';

import { createContext, useContext, useState, useCallback, type PropsWithChildren } from 'react';

export interface Deck {
  id: number;
  name: string;
  description: string;
  created: Date;
  modified: Date;
}

export interface Card {
  id: number;
  noteId: number;
  deckId: number;
  templateIndex: number;
  state: number;
  due: Date;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  lastReview?: Date;
  created: Date;
  modified: Date;
}

interface AppContextType {
  decks: Deck[];
  currentDeck: Deck | null;
  setDecks: (decks: Deck[]) => void;
  setCurrentDeck: (deck: Deck | null) => void;
  addDeck: (deck: Deck) => void;
  updateDeck: (id: number, updates: Partial<Deck>) => void;
  deleteDeck: (id: number) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: PropsWithChildren) {
  const [decks, setDecksState] = useState<Deck[]>([]);
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setDecks = useCallback((newDecks: Deck[]) => {
    setDecksState(newDecks);
  }, []);

  const addDeck = useCallback((deck: Deck) => {
    setDecksState(prev => [...prev, deck]);
  }, []);

  const updateDeck = useCallback((id: number, updates: Partial<Deck>) => {
    setDecksState(prev => prev.map(deck => 
      deck.id === id ? { ...deck, ...updates } : deck
    ));
  }, []);

  const deleteDeck = useCallback((id: number) => {
    setDecksState(prev => prev.filter(deck => deck.id !== id));
    if (currentDeck?.id === id) {
      setCurrentDeck(null);
    }
  }, [currentDeck]);

  const value: AppContextType = {
    decks,
    currentDeck,
    setDecks,
    setCurrentDeck,
    addDeck,
    updateDeck,
    deleteDeck,
    isLoading,
    setIsLoading,
    error,
    setError,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
