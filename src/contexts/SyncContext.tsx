import React, { createContext, useContext, useState, useCallback } from 'react';

interface CloudBackup {
  id: number;
  backupData: string;
  deviceId: string;
  deviceType: string;
  version: number;
  created: Date;
}

interface SyncQueueItem {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  data?: any;
  synced: boolean;
  created: Date;
}

interface SyncContextType {
  backups: CloudBackup[];
  syncQueue: SyncQueueItem[];
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  createBackup: (data: any, deviceId: string, deviceType: string) => Promise<void>;
  fetchBackups: () => Promise<void>;
  restoreBackup: (backupId: number) => Promise<any>;
  getLatestBackup: (deviceType?: string) => Promise<CloudBackup | null>;
  addToSyncQueue: (item: Omit<SyncQueueItem, 'id' | 'created' | 'synced'>) => Promise<void>;
  fetchSyncQueue: (deviceId: string) => Promise<void>;
  markSynced: (itemId: number) => Promise<void>;
  syncAll: (deviceId: string) => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [backups, setBackups] = useState<CloudBackup[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // オンライン/オフライン状態の監視
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const createBackup = useCallback(async (data: any, deviceId: string, deviceType: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, deviceId, deviceType, version: 1 }),
      });
      if (!res.ok) throw new Error('Failed to create backup');
      await fetchBackups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBackups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/backups');
      if (!res.ok) throw new Error('Failed to fetch backups');
      const data = await res.json();
      setBackups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreBackup = useCallback(async (backupId: number) => {
    setError(null);
    const res = await fetch(`/api/backups/restore/${backupId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to restore backup');
    return res.json();
  }, []);

  const getLatestBackup = useCallback(async (deviceType?: string) => {
    setError(null);
    const url = deviceType 
      ? `/api/backups/latest?deviceType=${deviceType}`
      : '/api/backups/latest';
    
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to get latest backup');
    return res.json();
  }, []);

  const addToSyncQueue = useCallback(async (item: Omit<SyncQueueItem, 'id' | 'created' | 'synced'>) => {
    setError(null);
    const res = await fetch('/api/sync/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, deviceId: item.entityId.toString() }),
    });
    if (!res.ok) throw new Error('Failed to add to sync queue');
  }, []);

  const fetchSyncQueue = useCallback(async (deviceId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sync/queue?deviceId=${deviceId}`);
      if (!res.ok) throw new Error('Failed to fetch sync queue');
      const data = await res.json();
      setSyncQueue(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const markSynced = useCallback(async (itemId: number) => {
    setError(null);
    const res = await fetch('/api/sync/mark-synced', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId }),
    });
    if (!res.ok) throw new Error('Failed to mark as synced');
  }, []);

  const syncAll = useCallback(async (deviceId: string) => {
    await fetchSyncQueue(deviceId);
    for (const item of syncQueue) {
      if (!item.synced) {
        await markSynced(item.id);
      }
    }
    await fetchSyncQueue(deviceId);
  }, [syncQueue, fetchSyncQueue, markSynced]);

  return (
    <SyncContext.Provider value={{
      backups,
      syncQueue,
      loading,
      error,
      isOnline,
      createBackup,
      fetchBackups,
      restoreBackup,
      getLatestBackup,
      addToSyncQueue,
      fetchSyncQueue,
      markSynced,
      syncAll,
    }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
}
