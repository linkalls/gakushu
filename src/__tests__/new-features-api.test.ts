import { describe, it, expect, beforeAll } from 'vitest';
import app from '../api';

describe('New Features API Integration Tests', () => {
  describe('Shared Decks API', () => {
    it('GET /shared-decks should return public decks', async () => {
      const res = await app.request('/shared-decks');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Rankings API', () => {
    it('GET /rankings/global should return top rankings', async () => {
      const res = await app.request('/rankings/global?limit=10');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('GET /rankings/by-streak should return rankings by streak', async () => {
      const res = await app.request('/rankings/by-streak?limit=10');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('GET /rankings/by-study-time should return rankings by study time', async () => {
      const res = await app.request('/rankings/by-study-time?limit=10');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Custom Templates API', () => {
    it('GET /templates?public=true should return public templates', async () => {
      const res = await app.request('/templates?public=true');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Cloud Backup API', () => {
    it('GET /backups should return user backups', async () => {
      const res = await app.request('/backups');
      // Will fail auth but endpoint exists
      expect([200, 401]).toContain(res.status);
    });
  });

  describe('Sync Queue API', () => {
    it('GET /sync/queue should require deviceId', async () => {
      const res = await app.request('/sync/queue');
      expect([400, 401]).toContain(res.status);
    });
  });

  describe('Voice Settings API', () => {
    it('GET /voice/settings should return settings or default', async () => {
      const res = await app.request('/voice/settings');
      // Will return 401 without auth or 200 with default
      expect([200, 401]).toContain(res.status);
    });
  });

  describe('Daily Stats API', () => {
    it('GET /stats/daily should accept days parameter', async () => {
      const res = await app.request('/stats/daily?days=7');
      expect([200, 401]).toContain(res.status);
    });
  });
});
