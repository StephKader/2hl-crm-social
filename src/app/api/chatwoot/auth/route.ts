import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { chatwootSignIn, ChatwootError } from '@/lib/chatwoot/client';
import { mapChatwootRole } from '@/lib/chatwoot/transformers';
import type { ChatwootAuthResponse, ChatwootSessionUser } from '@/lib/chatwoot/types';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const data: ChatwootAuthResponse = await chatwootSignIn(email, password);
    const agent = data.data;

    const sessionUser: ChatwootSessionUser = {
      id: agent.account_id,
      name: agent.name,
      email: agent.email,
      role: mapChatwootRole({
        id: 0,
        name: agent.name,
        email: agent.email,
        role: agent.role,
        thumbnail: agent.thumbnail,
        availability_status: 'online',
        custom_attributes: agent.custom_attributes,
      }),
      avatarUrl: agent.thumbnail || undefined,
      accessToken: agent.access_token,
      pubsubToken: agent.pubsub_token,
      accountId: agent.account_id,
    };

    const cookieStore = await cookies();
    cookieStore.set('chatwoot_session', JSON.stringify(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({
      id: String(sessionUser.id),
      name: sessionUser.name,
      email: sessionUser.email,
      role: sessionUser.role,
      avatarUrl: sessionUser.avatarUrl,
    });
  } catch (err) {
    if (err instanceof ChatwootError && err.status === 401) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }
    console.error('Auth error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('chatwoot_session');
  return NextResponse.json({ success: true });
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('chatwoot_session')?.value;
    if (!raw) return NextResponse.json({ user: null });

    const session: ChatwootSessionUser = JSON.parse(raw);
    return NextResponse.json({
      user: {
        id: String(session.id),
        name: session.name,
        email: session.email,
        role: session.role,
        avatarUrl: session.avatarUrl,
      },
      pubsubToken: session.pubsubToken,
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
