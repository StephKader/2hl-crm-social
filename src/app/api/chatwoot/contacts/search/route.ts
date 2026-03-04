import { NextRequest, NextResponse } from 'next/server';
import { chatwootAgent } from '@/lib/chatwoot/client';
import { requireSession } from '@/lib/chatwoot/session';
import { transformContact } from '@/lib/chatwoot/transformers';
import type { ChatwootContact } from '@/lib/chatwoot/types';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const client = chatwootAgent(session.accessToken);
    const q = new URL(request.url).searchParams.get('q') || '';

    const data = await client.get<{ payload: ChatwootContact[] }>('/contacts/search', { q });
    const contacts = (data.payload || []).map((c) => transformContact(c));

    return NextResponse.json({ contacts });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'NOT_AUTHENTICATED')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
