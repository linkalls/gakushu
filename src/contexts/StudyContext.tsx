'use client';

import { createContext, useContext, useState, useCallback, type PropsWithChildren } from 'react';

export interface StudySession {
  id: string;
  deckId: number;
  startTime: Date;
  endTime?: Date;
  cardsStudied: number;
  correctAnswers: number;
}

interface StudyContextType {
  currentSession: StudySession | null;
  sessions: StudySession[];
  startSession: (deckId: number) => void;
  endSession: () => void;
  recordAnswer: (correct: boolean) => void;
  getSessions: () => StudySession[];
  getTodayStats: () => { studied: number; correct: number; accuracy: number };
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: PropsWithChildren) {
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);

  const startSession = useCallback((deckId: number) => {
    const session: StudySession = {
      id: crypto.randomUUID(),
      deckId,
      startTime: new Date(),
      cardsStudied: 0,
      correctAnswers: 0,
    };
    setCurrentSession(session);
  }, []);

  const endSession = useCallback(() => {
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        endTime: new Date(),
      };
      setSessions(prev => [...prev, completedSession]);
      setCurrentSession(null);
    }
  }, [currentSession]);

  const recordAnswer = useCallback((correct: boolean) => {
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        cardsStudied: prev.cardsStudied + 1,
        correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
      } : null);
    }
  }, [currentSession]);

  const getSessions = useCallback(() => {
    return sessions;
  }, [sessions]);

  const getTodayStats = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySessions = sessions.filter(s => {
      const sessionDate = new Date(s.startTime);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });

    const studied = todaySessions.reduce((sum, s) => sum + s.cardsStudied, 0);
    const correct = todaySessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const accuracy = studied > 0 ? (correct / studied) * 100 : 0;

    return { studied, correct, accuracy };
  }, [sessions]);

  const value: StudyContextType = {
    currentSession,
    sessions,
    startSession,
    endSession,
    recordAnswer,
    getSessions,
    getTodayStats,
  };

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
}
