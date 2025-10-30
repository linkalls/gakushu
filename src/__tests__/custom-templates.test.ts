import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import { customTemplates } from '../db/schema';
import { eq } from 'drizzle-orm';

describe('Custom Template Features', () => {
  const testUserId = 'test-user-' + Date.now();

  beforeEach(async () => {
    await db.delete(customTemplates).where(eq(customTemplates.userId, testUserId));
  });

  it('should create custom template', async () => {
    const [template] = await db.insert(customTemplates).values({
      userId: testUserId,
      name: 'Custom Basic',
      frontTemplate: '<div>{{Front}}</div>',
      backTemplate: '<div>{{Back}}</div>',
      css: '.card { font-size: 20px; }',
      javascript: 'console.log("loaded");',
      isPublic: false,
      created: new Date(),
      modified: new Date(),
    }).returning();

    expect(template).toBeDefined();
    expect(template.name).toBe('Custom Basic');
    expect(template.frontTemplate).toContain('{{Front}}');
  });

  it('should get public templates', async () => {
    // パブリックテンプレートを作成
    await db.insert(customTemplates).values([
      {
        userId: testUserId,
        name: 'Public Template 1',
        frontTemplate: '<div>{{Front}}</div>',
        backTemplate: '<div>{{Back}}</div>',
        isPublic: true,
        created: new Date(),
        modified: new Date(),
      },
      {
        userId: testUserId,
        name: 'Private Template',
        frontTemplate: '<div>{{Front}}</div>',
        backTemplate: '<div>{{Back}}</div>',
        isPublic: false,
        created: new Date(),
        modified: new Date(),
      },
    ]);

    const publicTemplates = await db.select()
      .from(customTemplates)
      .where(eq(customTemplates.isPublic, true));

    expect(publicTemplates.length).toBeGreaterThan(0);
    expect(publicTemplates.every(t => t.isPublic)).toBe(true);
  });

  it('should increment download count', async () => {
    const [template] = await db.insert(customTemplates).values({
      userId: testUserId,
      name: 'Popular Template',
      frontTemplate: '<div>{{Front}}</div>',
      backTemplate: '<div>{{Back}}</div>',
      isPublic: true,
      created: new Date(),
      modified: new Date(),
    }).returning();

    const [updated] = await db.update(customTemplates)
      .set({ downloadCount: template.downloadCount + 1 })
      .where(eq(customTemplates.id, template.id))
      .returning();

    expect(updated.downloadCount).toBe(1);
  });
});
