// Client HTTP pour Chatwoot — SERVER SIDE UNIQUEMENT

const BASE_URL = process.env.CHATWOOT_BASE_URL!;
const ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID!;
const ADMIN_TOKEN = process.env.CHATWOOT_ADMIN_TOKEN!;

class ChatwootClient {
  private baseUrl: string;
  private accountId: string;
  private token: string;

  constructor(token?: string) {
    this.baseUrl = BASE_URL;
    this.accountId = ACCOUNT_ID;
    this.token = token || ADMIN_TOKEN;
  }

  private url(path: string): string {
    return `${this.baseUrl}/api/v1/accounts/${this.accountId}${path}`;
  }

  private headers() {
    return {
      api_access_token: this.token,
      'Content-Type': 'application/json',
    };
  }

  async get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
    const url = new URL(this.url(path));
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    }
    const res = await fetch(url.toString(), {
      headers: this.headers(),
      next: { revalidate: 0 },
    });
    if (!res.ok) throw new ChatwootError(res.status, await res.text());
    return res.json();
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(this.url(path), {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new ChatwootError(res.status, await res.text());
    return res.json();
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(this.url(path), {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new ChatwootError(res.status, await res.text());
    return res.json();
  }

  async delete(path: string): Promise<void> {
    const res = await fetch(this.url(path), {
      method: 'DELETE',
      headers: this.headers(),
    });
    if (!res.ok) throw new ChatwootError(res.status, await res.text());
  }
}

export class ChatwootError extends Error {
  constructor(
    public status: number,
    public body: string
  ) {
    super(`Chatwoot API Error ${status}: ${body}`);
  }
}

export const chatwootAdmin = new ChatwootClient();

export function chatwootAgent(agentToken: string) {
  return new ChatwootClient(agentToken);
}

export async function chatwootSignIn(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/sign_in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new ChatwootError(res.status, body);
  }
  return res.json();
}
