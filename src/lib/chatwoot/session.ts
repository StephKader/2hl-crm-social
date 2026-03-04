import { cookies } from 'next/headers';
import type { ChatwootSessionUser } from './types';

export async function getSession(): Promise<ChatwootSessionUser | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('chatwoot_session')?.value;
    if (!raw) return null;
    return JSON.parse(raw) as ChatwootSessionUser;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<ChatwootSessionUser> {
  const session = await getSession();
  if (!session) throw new Error('NOT_AUTHENTICATED');
  return session;
}
