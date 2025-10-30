import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface SharedDeck {
  id: number;
  shareCode: string;
  title: string;
  description?: string;
  downloadCount: number;
  likeCount: number;
}

interface SharingContextType {
  sharedDecks: SharedDeck[];
  loading: boolean;
  error: string | null;
  fetchPublicDecks: () => Promise<void>;
  shareDeck: (deckId: number, title: string, description?: string, isPublic?: boolean) => Promise<SharedDeck>;
  downloadDeck: (shareCode: string) => Promise<any>;
  likeDeck: (deckId: number) => Promise<void>;
}

const SharingContext = createContext<SharingContextType | undefined>(undefined);

export function SharingProvider({ children }: { children: React.ReactNode }) {
  const [sharedDecks, setSharedDecks] = useState<SharedDeck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicDecks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/shared-decks');
      if (!res.ok) throw new Error('Failed to fetch shared decks');
      const data = await res.json();
      setSharedDecks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const shareDeck = useCallback(async (
    deckId: number,
    title: string,
    description?: string,
    isPublic = true
  ): Promise<SharedDeck> => {
    setError(null);
    const res = await fetch('/api/shared-decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deckId, title, description, isPublic }),
    });
    if (!res.ok) throw new Error('Failed to share deck');
    return res.json();
  }, []);

  const downloadDeck = useCallback(async (shareCode: string) => {
    setError(null);
    const res = await fetch(`/api/shared-decks/${shareCode}/download`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to download deck');
    return res.json();
  }, []);

  const likeDeck = useCallback(async (deckId: number) => {
    setError(null);
    const res = await fetch(`/api/shared-decks/${deckId}/like`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to like deck');
    await fetchPublicDecks(); // Refresh list
  }, [fetchPublicDecks]);

  return (
    <SharingContext.Provider value={{
      sharedDecks,
      loading,
      error,
      fetchPublicDecks,
      shareDeck,
      downloadDeck,
      likeDeck,
    }}>
      {children}
    </SharingContext.Provider>
  );
}

export function useSharing() {
  const context = useContext(SharingContext);
  if (!context) {
    throw new Error('useSharing must be used within SharingProvider');
  }
  return context;
}
