import { NextRequest, NextResponse } from 'next/server';
import { chatwootAgent } from '@/lib/chatwoot/client';
import { requireSession } from '@/lib/chatwoot/session';
import { transformContact } from '@/lib/chatwoot/transformers';
import type { ChatwootContact } from '@/lib/chatwoot/types';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const client = chatwootAgent(session.accessToken);
    const { id } = await params;

    const contact = await client.get<ChatwootContact>(`/contacts/${id}`);
    return NextResponse.json(transformContact(contact));
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

    const updated = await client.put<ChatwootContact>(`/contacts/${id}`, body);
    return NextResponse.json(transformContact(updated));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'NOT_AUTHENTICATED')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
