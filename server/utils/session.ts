import type { H3Event } from 'h3';

export interface SessionData {
  userId: string;
  email: string;
}

export async function getAuthSession(event: H3Event) {
  return await useSession<SessionData>(event, {
    password: process.env.SESSION_SECRET || '',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    name: 'gdc-session',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  });
}
