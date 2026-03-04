import { NextResponse } from 'next/server';
import { chatwootAdmin } from '@/lib/chatwoot/client';
import { transformAgent } from '@/lib/chatwoot/transformers';
import type { ChatwootAgent } from '@/lib/chatwoot/types';

export async function GET() {
  try {
    const agents = await chatwootAdmin.get<ChatwootAgent[]>('/agents');
    return NextResponse.json(agents.map(transformAgent));
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
