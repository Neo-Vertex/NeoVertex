// NeoVertex API Client — substitui o Supabase SDK
// Mantém a mesma interface para não alterar os demais componentes.

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
const TOKEN_KEY = 'nv_auth_token';

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
const removeToken = () => localStorage.removeItem(TOKEN_KEY);

const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Tipo de resposta padrão (compatível com o que os componentes esperam)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiResult = { data: any; error: any; count?: number | null };

// ── Query Builder ─────────────────────────────────────────────────────────────

class QueryBuilder {
  private _table: string;
  private _method = 'GET';
  private _params: Record<string, string> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _body: any = null;
  private _single = false;
  private _countMode = false;
  private _headMode = false;

  constructor(table: string) {
    this._table = table;
  }

  select(columns = '*', options?: { count?: string; head?: boolean }) {
    if (columns !== '*') this._params.select = columns;
    if (options?.count) this._countMode = true;
    if (options?.head) this._headMode = true;
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert(data: any) { this._method = 'POST'; this._body = data; return this; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update(data: any) { this._method = 'PATCH'; this._body = data; return this; }
  delete() { this._method = 'DELETE'; return this; }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eq(col: string, val: any) { this._params[col] = `eq.${val}`; return this; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  neq(col: string, val: any) { this._params[col] = `neq.${val}`; return this; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gt(col: string, val: any) { this._params[col] = `gt.${val}`; return this; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lt(col: string, val: any) { this._params[col] = `lt.${val}`; return this; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gte(col: string, val: any) { this._params[col] = `gte.${val}`; return this; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lte(col: string, val: any) { this._params[col] = `lte.${val}`; return this; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  like(col: string, val: any) { this._params[col] = `like.${val}`; return this; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ilike(col: string, val: any) { this._params[col] = `ilike.${val}`; return this; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  in(col: string, vals: any[]) { this._params[col] = `in.(${vals.join(',')})`; return this; }
  or(cond: string) { this._params['or'] = `(${cond})`; return this; }
  order(col: string, opts?: { ascending?: boolean }) {
    this._params['order'] = `${col}.${opts?.ascending === false ? 'desc' : 'asc'}`;
    return this;
  }
  limit(n: number) { this._params['limit'] = String(n); return this; }
  single() { this._single = true; return this; }

  // Implementação do PromiseLike para que `await queryBuilder` funcione com tipagem correta
  then<TResult1 = ApiResult, TResult2 = never>(
    onfulfilled?: ((value: ApiResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this._run().then(onfulfilled as never, onrejected as never);
  }

  private async _run(): Promise<ApiResult> {
    const qs = new URLSearchParams(this._params).toString();
    const url = `${API_URL}/api/${this._table}${qs ? `?${qs}` : ''}`;

    try {
      const res = await fetch(url, {
        method: this._method,
        headers: authHeaders(),
        ...(this._body !== null ? { body: JSON.stringify(this._body) } : {}),
      });

      if (this._headMode) {
        const count = res.headers.get('x-total-count');
        return { count: count ? parseInt(count) : 0, data: null, error: null };
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        return { data: null, error: err };
      }

      if (this._method === 'DELETE' || res.status === 204) {
        return { data: null, error: null };
      }

      const json = await res.json();

      if (this._countMode) {
        return { count: json?.count ?? null, data: json?.data ?? json, error: null };
      }

      if (this._single) {
        const item = Array.isArray(json) ? (json[0] ?? null) : json;
        return { data: item, error: null };
      }

      return { data: json, error: null };
    } catch (e) {
      return { data: null, error: { message: (e as Error).message } };
    }
  }
}

// ── Realtime (polling a cada 5s como substituto) ──────────────────────────────

class RealtimeChannel {
  private _cbs: Array<(p: unknown) => void> = [];
  private _timer: ReturnType<typeof setInterval> | null = null;

  on(_event: string, _filter: unknown, callback: (payload: unknown) => void) {
    this._cbs.push(callback);
    return this;
  }

  subscribe() {
    this._timer = setInterval(() => this._cbs.forEach(cb => cb({})), 5000);
    return this;
  }

  unsubscribe() {
    if (this._timer) clearInterval(this._timer);
    return Promise.resolve('ok' as const);
  }
}

// ── Cliente Principal ─────────────────────────────────────────────────────────

export const supabase = {
  auth: {
    getUser: async () => {
      const token = getToken();
      if (!token) return { data: { user: null }, error: null };
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, { headers: authHeaders() });
        if (!res.ok) { removeToken(); return { data: { user: null }, error: null }; }
        const user = await res.json();
        return { data: { user }, error: null };
      } catch {
        return { data: { user: null }, error: null };
      }
    },

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok) return { data: null, error: json };
        setToken(json.token);
        return { data: { user: json.user }, error: null };
      } catch (e) {
        return { data: null, error: { message: (e as Error).message } };
      }
    },

    signUp: async ({ email, password }: { email: string; password: string }) => {
      try {
        const res = await fetch(`${API_URL}/api/auth/signup`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok) return { data: null, error: json };
        return { data: { user: json.user }, error: null };
      } catch (e) {
        return { data: null, error: { message: (e as Error).message } };
      }
    },

    signOut: async () => {
      removeToken();
      return { error: null };
    },
  },

  from: (table: string) => new QueryBuilder(table),

  channel: (_name: string) => new RealtimeChannel(),

  rpc: async (name: string, params: Record<string, unknown>) => {
    try {
      const res = await fetch(`${API_URL}/api/rpc/${name}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(params),
      });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json };
      return { data: json, error: null };
    } catch (e) {
      return { data: null, error: { message: (e as Error).message } };
    }
  },
};

export default supabase;
