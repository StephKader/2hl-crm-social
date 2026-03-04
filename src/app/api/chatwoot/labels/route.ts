import { NextRequest, NextResponse } from 'next/server';
import { chatwootAdmin } from '@/lib/chatwoot/client';
import { requireSession } from '@/lib/chatwoot/session';
import { transformLabel } from '@/lib/chatwoot/transformers';
import type { ChatwootLabel } from '@/lib/chatwoot/types';

export async function GET() {
  try {
    const data = await chatwootAdmin.get<{ payload: ChatwootLabel[] }>('/labels');
    return NextResponse.json(data.payload.map(transformLabel));
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    const { title } = await request.json();
    const label = await chatwootAdmin.post<ChatwootLabel>('/labels', { title });
    return NextResponse.json(transformLabel(label));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'NOT_AUTHENTICATED')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
