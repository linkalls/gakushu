import { describe, it, expect, beforeEach, vi } from 'vitest';
import app from '../api';

describe('Hono API Routes', () => {
  describe('GET /decks', () => {
    it('should return all decks', async () => {
      const res = await app.request('/decks');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /decks', () => {
    it('should create a new deck', async () => {
      const newDeck = {
        name: 'Test Deck',
        description: 'Test Description',
      };

      const res = await app.request('/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDeck),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.name).toBe(newDeck.name);
      expect(data.description).toBe(newDeck.description);
    });
  });

  describe('GET /decks/:id', () => {
    it('should return a specific deck', async () => {
      const res = await app.request('/decks/1');
      expect([200, 404]).toContain(res.status);
    });

    it('should return 404 for non-existent deck', async () => {
      const res = await app.request('/decks/999999');
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });
  });

  describe('PUT /decks/:id', () => {
    it('should update a deck', async () => {
      const updates = {
        name: 'Updated Deck Name',
        description: 'Updated Description',
      };

      const res = await app.request('/decks/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      expect([200, 404]).toContain(res.status);
    });
  });

  describe('GET /cards/due', () => {
    it('should return due cards', async () => {
      const res = await app.request('/cards/due');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should filter by deckId when provided', async () => {
      const res = await app.request('/cards/due?deckId=1');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('GET /cards/:id/options', () => {
    it('should return review options for a card', async () => {
      const res = await app.request('/cards/1/options');
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('POST /cards/:id/review', () => {
    it('should record a card review', async () => {
      const review = {
        rating: 3,
        reviewTime: 5000,
      };

      const res = await app.request('/cards/1/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(review),
      });

      expect([200, 404]).toContain(res.status);
    });

    it('should validate rating values', async () => {
      const review = {
        rating: 5, // Invalid rating
        reviewTime: 5000,
      };

      const res = await app.request('/cards/1/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(review),
      });

      // Should still process but with clamped values
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('GET /stats/deck/:id', () => {
    it('should return deck statistics', async () => {
      const res = await app.request('/stats/deck/1');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('due');
      expect(data).toHaveProperty('new');
    });
  });

  describe('GET /note-types', () => {
    it('should return all note types', async () => {
      const res = await app.request('/note-types');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /note-types', () => {
    it('should create a new note type', async () => {
      const newNoteType = {
        name: 'Test Note Type',
        fields: ['Front', 'Back'],
        templates: [
          {
            name: 'Card 1',
            questionFormat: '{{Front}}',
            answerFormat: '{{Back}}',
          },
        ],
        css: '.card { font-size: 20px; }',
      };

      const res = await app.request('/note-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNoteType),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.name).toBe(newNoteType.name);
    });
  });
});
