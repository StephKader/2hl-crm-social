import { NextRequest, NextResponse } from 'next/server';
import { chatwootAgent } from '@/lib/chatwoot/client';
import { requireSession } from '@/lib/chatwoot/session';
import { transformMessage } from '@/lib/chatwoot/transformers';
import type { ChatwootMessage } from '@/lib/chatwoot/types';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const client = chatwootAgent(session.accessToken);
    const { id } = await params;

    const data = await client.get<{ payload: ChatwootMessage[] }>(`/conversations/${id}/messages`);
    const messages = (data.payload || [])
      .filter((m) => m.message_type !== 2)
      .map(transformMessage);

    return NextResponse.json({ messages });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'NOT_AUTHENTICATED')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const client = chatwootAgent(session.accessToken);
    const { id } = await params;
    const { content, private: isPrivate = false } = await request.json();

    const msg = await client.post<ChatwootMessage>(`/conversations/${id}/messages`, {
      content,
      message_type: 'outgoing',
      private: isPrivate,
    });

    return NextResponse.json(transformMessage(msg));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'NOT_AUTHENTICATED')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
