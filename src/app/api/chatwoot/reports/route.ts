import { NextRequest, NextResponse } from 'next/server';
import { chatwootAdmin } from '@/lib/chatwoot/client';
import { requireSession } from '@/lib/chatwoot/session';

export async function GET(request: NextRequest) {
  try {
    await requireSession();
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'conversations_count';
    const type = searchParams.get('type') || 'account';
    const since = searchParams.get('since');
    const until = searchParams.get('until');

    const params: Record<string, string> = { metric, type };
    if (since) params.since = since;
    if (until) params.until = until;

    const data = await chatwootAdmin.get('/reports', params);
    return NextResponse.json(data);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'NOT_AUTHENTICATED')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    // Reports API might not exist on this Chatwoot version — return empty array
    return NextResponse.json([]);
  }
}
