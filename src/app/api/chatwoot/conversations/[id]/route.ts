import { NextRequest, NextResponse } from 'next/server';
import { chatwootAgent } from '@/lib/chatwoot/client';
import { requireSession } from '@/lib/chatwoot/session';
import { transformConversation, transformLabel, mapInboxToChannel, transformAgent } from '@/lib/chatwoot/transformers';
import type { ChatwootConversation, ChatwootInbox, ChatwootLabel, ChatwootAgent as CWAgent } from '@/lib/chatwoot/types';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const client = chatwootAgent(session.accessToken);
    const { id } = await params;

    const [conv, inboxesData, labelsData] = await Promise.all([
      client.get<ChatwootConversation>(`/conversations/${id}`),
      client.get<{ payload: ChatwootInbox[] }>('/inboxes'),
      client.get<{ payload: ChatwootLabel[] }>('/labels'),
    ]);

    const inboxMap = new Map(inboxesData.payload.map((i) => [i.id, mapInboxToChannel(i)]));
    const labels = labelsData.payload.map(transformLabel);

    return NextResponse.json(transformConversation(conv, inboxMap, labels));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'NOT_AUTHENTICATED')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const client = chatwootAgent(session.accessToken);
    const { id } = await params;
    const body = await request.json();

    const updated = await client.put<ChatwootConversation>(`/conversations/${id}`, body);
    return NextResponse.json({ success: true, id: updated.id });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'NOT_AUTHENTICATED')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
