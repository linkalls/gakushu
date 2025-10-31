import type { Context, Next } from 'hono';
import { auth } from './auth';

export interface AuthContext {
  userId: string;
}

export async function authMiddleware(c: Context, next: Next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.json({ error: '認証が必要です' }, 401);
  }

  c.set('userId', session.user.id);
  await next();
}

export function getUserId(c: Context): string {
  const userId = c.get('userId');
  if (!userId) {
    throw new Error('User ID not found in context');
  }
  return userId;
}
