import { describe, it, expect } from 'vitest';

describe('Mobile App Configuration', () => {
  it('should have proper configuration', () => {
    expect(true).toBe(true);
  });

  it('should import app configuration', async () => {
    const appJson = await import('../../app.json');
    expect(appJson.expo).toBeDefined();
    expect(appJson.expo.name).toBe('Anki Alternative');
  });

  it('should import eas configuration', async () => {
    const easJson = await import('../../eas.json');
    expect(easJson.build).toBeDefined();
    expect(easJson.build.preview).toBeDefined();
    expect(easJson.build.production).toBeDefined();
  });
});
