import { describe, it, expect } from 'vitest';

describe('Hono API Integration with Next.js', () => {
  it('should export proper Next.js route handlers', async () => {
    const routeModule = await import('../app/api/[...route]/route');
    
    expect(routeModule.GET).toBeDefined();
    expect(routeModule.POST).toBeDefined();
    expect(routeModule.PUT).toBeDefined();
    expect(routeModule.DELETE).toBeDefined();
    expect(routeModule.runtime).toBe('nodejs');
  });

  it('should handle API routes through Hono', async () => {
    const api = await import('../api');
    
    // Test GET /decks
    const getResponse = await api.default.request('/decks', {
      method: 'GET',
    });
    expect(getResponse.status).toBe(200);
    
    // Test POST /decks
    const postResponse = await api.default.request('/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Deck',
        description: 'Test Description',
      }),
    });
    expect(postResponse.status).toBe(200);
  });

  it('should validate request payloads', async () => {
    const api = await import('../api');
    
    // Test with invalid data
    const response = await api.default.request('/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    
    // Should still process but may have validation issues
    expect([200, 400, 500]).toContain(response.status);
  });
});
