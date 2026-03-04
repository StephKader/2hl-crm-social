import { NextRequest, NextResponse } from 'next/server';
import { chatwootAgent } from '@/lib/chatwoot/client';
import { requireSession } from '@/lib/chatwoot/session';
import { transformContact, transformLabel } from '@/lib/chatwoot/transformers';
import type { ChatwootContact, ChatwootLabel } from '@/lib/chatwoot/types';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const client = chatwootAgent(session.accessToken);

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';

    const [contactsData, labelsData] = await Promise.all([
      client.get<{ payload: ChatwootContact[] }>('/contacts', { page: parseInt(page), sort: 'name' }),
      client.get<{ payload: ChatwootLabel[] }>('/labels'),
    ]);

    const labels = labelsData.payload.map(transformLabel);
    const contacts = (contactsData.payload || []).map((c) => transformContact(c, labels));

    return NextResponse.json({ contacts });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'NOT_AUTHENTICATED')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
