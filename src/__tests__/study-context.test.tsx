import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { StudyProvider, useStudy } from '../contexts/StudyContext';

describe('StudyContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <StudyProvider>{children}</StudyProvider>
  );

  it('should initialize with no session', () => {
    const { result } = renderHook(() => useStudy(), { wrapper });
    expect(result.current.currentSession).toBeNull();
    expect(result.current.sessions).toEqual([]);
  });

  it('should start a study session', () => {
    const { result } = renderHook(() => useStudy(), { wrapper });
    
    act(() => {
      result.current.startSession(1);
    });

    expect(result.current.currentSession).not.toBeNull();
    expect(result.current.currentSession?.deckId).toBe(1);
    expect(result.current.currentSession?.cardsStudied).toBe(0);
    expect(result.current.currentSession?.correctAnswers).toBe(0);
  });

  it('should record correct answer', () => {
    const { result } = renderHook(() => useStudy(), { wrapper });
    
    act(() => {
      result.current.startSession(1);
    });

    act(() => {
      result.current.recordAnswer(true);
    });

    expect(result.current.currentSession?.cardsStudied).toBe(1);
    expect(result.current.currentSession?.correctAnswers).toBe(1);
  });

  it('should record incorrect answer', () => {
    const { result } = renderHook(() => useStudy(), { wrapper });
    
    act(() => {
      result.current.startSession(1);
    });

    act(() => {
      result.current.recordAnswer(false);
    });

    expect(result.current.currentSession?.cardsStudied).toBe(1);
    expect(result.current.currentSession?.correctAnswers).toBe(0);
  });

  it('should end a session', () => {
    const { result } = renderHook(() => useStudy(), { wrapper });
    
    act(() => {
      result.current.startSession(1);
    });

    act(() => {
      result.current.recordAnswer(true);
      result.current.recordAnswer(false);
    });

    act(() => {
      result.current.endSession();
    });

    expect(result.current.currentSession).toBeNull();
    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.sessions[0].cardsStudied).toBe(2);
    expect(result.current.sessions[0].correctAnswers).toBe(1);
    expect(result.current.sessions[0].endTime).toBeDefined();
  });

  it('should calculate today stats correctly', () => {
    const { result } = renderHook(() => useStudy(), { wrapper });
    
    // First session
    act(() => {
      result.current.startSession(1);
      result.current.recordAnswer(true);
      result.current.recordAnswer(true);
      result.current.recordAnswer(false);
      result.current.endSession();
    });

    // Second session
    act(() => {
      result.current.startSession(2);
      result.current.recordAnswer(true);
      result.current.recordAnswer(false);
      result.current.endSession();
    });

    const stats = result.current.getTodayStats();
    expect(stats.studied).toBe(5);
    expect(stats.correct).toBe(3);
    expect(stats.accuracy).toBe(60);
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useStudy());
    }).toThrow('useStudy must be used within a StudyProvider');
  });
});
