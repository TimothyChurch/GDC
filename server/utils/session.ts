import type { H3Event } from 'h3';

export interface SessionData {
  userId: string;
  email: string;
}

let cachedSecret: string | null = null;

function getSessionSecret(): string {
  if (cachedSecret) return cachedSecret;

  const config = useRuntimeConfig();
  const secret = config.sessionSecret as string;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET env var must be set and be at least 32 characters');
  }
  cachedSecret = secret;
  return cachedSecret;
}

export async function getAuthSession(event: H3Event) {
  return await useSession<SessionData>(event, {
    password: getSessionSecret(),
    maxAge: 60 * 60 * 24 * 7, // 7 days
    name: 'gdc-session',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  });
}
