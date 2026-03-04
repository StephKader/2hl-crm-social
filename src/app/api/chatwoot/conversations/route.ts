import { NextRequest, NextResponse } from 'next/server';
import { chatwootAgent } from '@/lib/chatwoot/client';
import { requireSession } from '@/lib/chatwoot/session';
import { transformConversation, transformLabel, mapInboxToChannel } from '@/lib/chatwoot/transformers';
import type { ChatwootConversation, ChatwootInbox, ChatwootLabel } from '@/lib/chatwoot/types';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const client = chatwootAgent(session.accessToken);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'open';
    const page = searchParams.get('page') || '1';
    const inboxId = searchParams.get('inbox_id');
    const q = searchParams.get('q');

    const params: Record<string, string | number> = { status, page: parseInt(page) };
    if (inboxId) params.inbox_id = inboxId;
    if (q) params.q = q;

    const [convsData, inboxesData, labelsData] = await Promise.all([
      client.get<{ data: { payload: ChatwootConversation[] } }>('/conversations', params),
      client.get<{ payload: ChatwootInbox[] }>('/inboxes'),
      client.get<{ payload: ChatwootLabel[] }>('/labels'),
    ]);

    const inboxMap = new Map(inboxesData.payload.map((i) => [i.id, mapInboxToChannel(i)]));
    const labels = labelsData.payload.map(transformLabel);

    const conversations = (convsData.data?.payload || []).map((conv) =>
      transformConversation(conv, inboxMap, labels)
    );

    return NextResponse.json({ conversations, total: conversations.length });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'NOT_AUTHENTICATED') {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    console.error('Conversations error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
