import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useApp, type Deck } from '../contexts/AppContext';

describe('AppContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider>{children}</AppProvider>
  );

  const mockDeck: Deck = {
    id: 1,
    name: 'Test Deck',
    description: 'A test deck',
    created: new Date('2024-01-01'),
    modified: new Date('2024-01-01'),
  };

  it('should initialize with empty decks', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    expect(result.current.decks).toEqual([]);
    expect(result.current.currentDeck).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set decks', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    
    act(() => {
      result.current.setDecks([mockDeck]);
    });

    expect(result.current.decks).toHaveLength(1);
    expect(result.current.decks[0]).toEqual(mockDeck);
  });

  it('should add a deck', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    
    act(() => {
      result.current.addDeck(mockDeck);
    });

    expect(result.current.decks).toHaveLength(1);
    expect(result.current.decks[0]).toEqual(mockDeck);
  });

  it('should update a deck', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    
    act(() => {
      result.current.addDeck(mockDeck);
    });

    act(() => {
      result.current.updateDeck(1, { name: 'Updated Deck' });
    });

    expect(result.current.decks[0].name).toBe('Updated Deck');
  });

  it('should delete a deck', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    
    act(() => {
      result.current.addDeck(mockDeck);
    });

    expect(result.current.decks).toHaveLength(1);

    act(() => {
      result.current.deleteDeck(1);
    });

    expect(result.current.decks).toHaveLength(0);
  });

  it('should set and clear current deck', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    
    act(() => {
      result.current.setCurrentDeck(mockDeck);
    });

    expect(result.current.currentDeck).toEqual(mockDeck);

    act(() => {
      result.current.setCurrentDeck(null);
    });

    expect(result.current.currentDeck).toBeNull();
  });

  it('should clear current deck when deleted', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    
    act(() => {
      result.current.addDeck(mockDeck);
      result.current.setCurrentDeck(mockDeck);
    });

    expect(result.current.currentDeck).toEqual(mockDeck);

    act(() => {
      result.current.deleteDeck(1);
    });

    expect(result.current.currentDeck).toBeNull();
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    
    act(() => {
      result.current.setIsLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setIsLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should handle error state', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    const errorMessage = 'Test error';
    
    act(() => {
      result.current.setError(errorMessage);
    });

    expect(result.current.error).toBe(errorMessage);

    act(() => {
      result.current.setError(null);
    });

    expect(result.current.error).toBeNull();
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useApp());
    }).toThrow('useApp must be used within an AppProvider');
  });
});
