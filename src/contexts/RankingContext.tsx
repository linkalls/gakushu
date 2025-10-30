import React, { createContext, useContext, useState, useCallback } from 'react';

interface Ranking {
  id: number;
  userId: string;
  totalReviews: number;
  totalStudyTime: number;
  currentStreak: number;
  longestStreak: number;
  rank?: number;
}

interface DailyStats {
  id: number;
  userId: string;
  date: Date;
  reviewCount: number;
  studyTime: number;
  newCardsLearned: number;
  cardsReviewed: number;
  streak: number;
}

interface RankingContextType {
  globalRankings: Ranking[];
  streakRankings: Ranking[];
  studyTimeRankings: Ranking[];
  userRanking: Ranking | null;
  dailyStats: DailyStats[];
  loading: boolean;
  error: string | null;
  fetchGlobalRankings: (limit?: number) => Promise<void>;
  fetchStreakRankings: (limit?: number) => Promise<void>;
  fetchStudyTimeRankings: (limit?: number) => Promise<void>;
  fetchUserRanking: (userId: string) => Promise<void>;
  fetchDailyStats: (days?: number) => Promise<void>;
  updateRanking: (reviewCount: number, studyTime: number, currentStreak: number) => Promise<void>;
  recordDailyStats: (stats: Partial<DailyStats>) => Promise<void>;
}

const RankingContext = createContext<RankingContextType | undefined>(undefined);

export function RankingProvider({ children }: { children: React.ReactNode }) {
  const [globalRankings, setGlobalRankings] = useState<Ranking[]>([]);
  const [streakRankings, setStreakRankings] = useState<Ranking[]>([]);
  const [studyTimeRankings, setStudyTimeRankings] = useState<Ranking[]>([]);
  const [userRanking, setUserRanking] = useState<Ranking | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGlobalRankings = useCallback(async (limit = 100) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rankings/global?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch rankings');
      const data = await res.json();
      setGlobalRankings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStreakRankings = useCallback(async (limit = 100) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rankings/by-streak?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch streak rankings');
      const data = await res.json();
      setStreakRankings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudyTimeRankings = useCallback(async (limit = 100) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rankings/by-study-time?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch study time rankings');
      const data = await res.json();
      setStudyTimeRankings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserRanking = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rankings/user/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user ranking');
      const data = await res.json();
      setUserRanking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setUserRanking(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDailyStats = useCallback(async (days = 30) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stats/daily?days=${days}`);
      if (!res.ok) throw new Error('Failed to fetch daily stats');
      const data = await res.json();
      setDailyStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRanking = useCallback(async (
    reviewCount: number,
    studyTime: number,
    currentStreak: number
  ) => {
    setError(null);
    const res = await fetch('/api/rankings/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewCount, studyTime, currentStreak }),
    });
    if (!res.ok) throw new Error('Failed to update ranking');
    const data = await res.json();
    setUserRanking(data);
  }, []);

  const recordDailyStats = useCallback(async (stats: Partial<DailyStats>) => {
    setError(null);
    const res = await fetch('/api/stats/daily', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stats),
    });
    if (!res.ok) throw new Error('Failed to record daily stats');
  }, []);

  return (
    <RankingContext.Provider value={{
      globalRankings,
      streakRankings,
      studyTimeRankings,
      userRanking,
      dailyStats,
      loading,
      error,
      fetchGlobalRankings,
      fetchStreakRankings,
      fetchStudyTimeRankings,
      fetchUserRanking,
      fetchDailyStats,
      updateRanking,
      recordDailyStats,
    }}>
      {children}
    </RankingContext.Provider>
  );
}

export function useRanking() {
  const context = useContext(RankingContext);
  if (!context) {
    throw new Error('useRanking must be used within RankingProvider');
  }
  return context;
}
