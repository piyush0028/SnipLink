const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface FetchOptions extends RequestInit {
  body?: any;
}

async function request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface UrlItem {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  expiresAt: string | null;
  createdAt: string;
  totalClicks: number;
}

export interface PaginatedUrls {
  urls: UrlItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Analytics {
  urlId: string;
  shortCode: string;
  totalClicks: number;
  byBrowser: { browser: string; count: number }[];
  byOs: { os: string; count: number }[];
  byDevice: { device: string; count: number }[];
  byCountry: { country: string; count: number }[];
  byReferrer: { referrer: string; count: number }[];
  byDay: { day: string; count: number }[];
}

export const api = {
  auth: {
    register(data: { email: string; password: string; name: string }) {
      return request<{ user: User }>('/api/auth/register', { method: 'POST', body: data });
    },
    login(data: { email: string; password: string }) {
      return request<{ user: User }>('/api/auth/login', { method: 'POST', body: data });
    },
    logout() {
      return request<{ message: string }>('/api/auth/logout', { method: 'POST' });
    },
    me() {
      return request<{ user: { userId: string; roles: string[] } }>('/api/auth/me');
    },
    refresh() {
      return request<{ message: string }>('/api/auth/refresh', { method: 'POST' });
    },
  },

  urls: {
    list(page = 1, limit = 10) {
      return request<PaginatedUrls>(`/api/urls?page=${page}&limit=${limit}`);
    },
    create(data: { originalUrl: string; customAlias?: string; expiresAt?: string }) {
      return request<UrlItem>('/api/urls', { method: 'POST', body: data });
    },
    update(id: string, data: { originalUrl?: string; expiresAt?: string }) {
      return request<UrlItem>(`/api/urls/${id}`, { method: 'PATCH', body: data });
    },
    delete(id: string) {
      return request<void>(`/api/urls/${id}`, { method: 'DELETE' });
    },
  },

  analytics: {
    get(urlId: string, from?: string, to?: string) {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString();
      return request<Analytics>(`/api/analytics/${urlId}${qs ? `?${qs}` : ''}`);
    },
  },
};
