import { NextResponse } from 'next/server';
import { chatwootAdmin } from '@/lib/chatwoot/client';
import { mapInboxToChannel } from '@/lib/chatwoot/transformers';
import type { ChatwootInbox } from '@/lib/chatwoot/types';

export async function GET() {
  try {
    const data = await chatwootAdmin.get<{ payload: ChatwootInbox[] }>('/inboxes');
    const inboxes = data.payload.map((inbox) => ({
      id: inbox.id,
      name: inbox.name,
      channel: mapInboxToChannel(inbox),
      channelType: inbox.channel_type,
    }));
    return NextResponse.json(inboxes);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
