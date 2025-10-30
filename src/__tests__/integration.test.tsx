import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AppProvider, useApp } from '../contexts/AppContext';
import { StudyProvider, useStudy } from '../contexts/StudyContext';

describe('Integration: App and Study Contexts', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider>
      <StudyProvider>
        {children}
      </StudyProvider>
    </AppProvider>
  );

  it('should integrate app state with study sessions', () => {
    const { result } = renderHook(
      () => ({
        app: useApp(),
        study: useStudy(),
      }),
      { wrapper }
    );

    const mockDeck = {
      id: 1,
      name: 'Test Deck',
      description: 'Integration test deck',
      created: new Date(),
      modified: new Date(),
    };

    // Add deck to app state
    act(() => {
      result.current.app.addDeck(mockDeck);
      result.current.app.setCurrentDeck(mockDeck);
    });

    expect(result.current.app.currentDeck).toEqual(mockDeck);

    // Start study session for the deck
    act(() => {
      result.current.study.startSession(mockDeck.id);
    });

    expect(result.current.study.currentSession).not.toBeNull();
    expect(result.current.study.currentSession?.deckId).toBe(mockDeck.id);

    // Record answers
    act(() => {
      result.current.study.recordAnswer(true);
      result.current.study.recordAnswer(true);
      result.current.study.recordAnswer(false);
    });

    expect(result.current.study.currentSession?.cardsStudied).toBe(3);
    expect(result.current.study.currentSession?.correctAnswers).toBe(2);

    // End session
    act(() => {
      result.current.study.endSession();
    });

    expect(result.current.study.currentSession).toBeNull();
    expect(result.current.study.sessions).toHaveLength(1);
  });

  it('should handle multiple decks and sessions', () => {
    const { result } = renderHook(
      () => ({
        app: useApp(),
        study: useStudy(),
      }),
      { wrapper }
    );

    const deck1 = {
      id: 1,
      name: 'Deck 1',
      description: '',
      created: new Date(),
      modified: new Date(),
    };

    const deck2 = {
      id: 2,
      name: 'Deck 2',
      description: '',
      created: new Date(),
      modified: new Date(),
    };

    act(() => {
      result.current.app.addDeck(deck1);
      result.current.app.addDeck(deck2);
    });

    expect(result.current.app.decks).toHaveLength(2);

    // Session for deck 1
    act(() => {
      result.current.app.setCurrentDeck(deck1);
      result.current.study.startSession(deck1.id);
      result.current.study.recordAnswer(true);
      result.current.study.endSession();
    });

    // Session for deck 2
    act(() => {
      result.current.app.setCurrentDeck(deck2);
      result.current.study.startSession(deck2.id);
      result.current.study.recordAnswer(false);
      result.current.study.endSession();
    });

    expect(result.current.study.sessions).toHaveLength(2);
    expect(result.current.study.sessions[0].deckId).toBe(deck1.id);
    expect(result.current.study.sessions[1].deckId).toBe(deck2.id);
  });

  it('should maintain state consistency when deleting decks', () => {
    const { result } = renderHook(
      () => ({
        app: useApp(),
        study: useStudy(),
      }),
      { wrapper }
    );

    const deck = {
      id: 1,
      name: 'Test Deck',
      description: '',
      created: new Date(),
      modified: new Date(),
    };

    act(() => {
      result.current.app.addDeck(deck);
      result.current.app.setCurrentDeck(deck);
      result.current.study.startSession(deck.id);
    });

    expect(result.current.app.currentDeck).toEqual(deck);
    expect(result.current.study.currentSession?.deckId).toBe(deck.id);

    act(() => {
      result.current.app.deleteDeck(deck.id);
    });

    expect(result.current.app.currentDeck).toBeNull();
    expect(result.current.app.decks).toHaveLength(0);
    // Study session continues even if deck is deleted
    expect(result.current.study.currentSession?.deckId).toBe(deck.id);
  });
});
