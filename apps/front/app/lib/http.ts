export interface HttpClientOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number;
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

function createAbortSignal(timeoutMs: number): AbortSignal | undefined {
  if (!timeoutMs || timeoutMs <= 0) return undefined;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  // Clear timeout when signal is aborted for any other reason
  controller.signal.addEventListener('abort', () => clearTimeout(id), { once: true });
  return controller.signal;
}

export class HttpError extends Error {
  status: number;
  url: string;
  body?: unknown;

  constructor(message: string, status: number, url: string, body?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
    this.body = body;
  }
}

export class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeoutMs: number;

  constructor(options: HttpClientOptions = {}) {
    const envBase = (import.meta as any).env?.VITE_API_URL as string | undefined;
    this.baseUrl = (options.baseUrl ?? envBase ?? '').replace(/\/$/, '');
    this.defaultHeaders = options.defaultHeaders ?? { 'Content-Type': 'application/json' };
    this.timeoutMs = options.timeoutMs ?? 15000;
  }

  private buildUrl(path: string): string {
    const pathname = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${pathname}`;
  }

  async request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    const { timeoutMs, headers, signal, body, ...rest } = options;

    // Merge headers; allow caller to override defaults
    const mergedHeaders: HeadersInit = { ...this.defaultHeaders, ...(headers ?? {}) };

    const controller = new AbortController();
    const signals: AbortSignal[] = [controller.signal];
    const timeoutSignal = createAbortSignal(timeoutMs ?? this.timeoutMs);
    if (timeoutSignal) signals.push(timeoutSignal);
    if (signal) signals.push(signal);

    const composite = new AbortController();
    signals.forEach(s => s.addEventListener('abort', () => composite.abort(), { once: true }));

    const url = this.buildUrl(path);
    const response = await fetch(url, {
      headers: mergedHeaders,
      body,
      signal: composite.signal,
      credentials: 'include',
      ...rest,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');
    let parsed: unknown = undefined;
    try {
      parsed = isJson ? await response.json() : await response.text();
    } catch {
      // Ignore parsing errors; will surface via response.ok
    }

    if (!response.ok) {
      const message = `HTTP ${response.status} for ${url}`;
      throw new HttpError(message, response.status, url, parsed);
    }

    return parsed as T;
  }

  get<T = unknown>(path: string, options: RequestOptions = {}) {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T = unknown, B = unknown>(path: string, body?: B, options: RequestOptions = {}) {
    const jsonBody = body !== undefined ? JSON.stringify(body) : undefined;
    return this.request<T>(path, { ...options, method: 'POST', body: jsonBody });
  }

  put<T = unknown, B = unknown>(path: string, body?: B, options: RequestOptions = {}) {
    const jsonBody = body !== undefined ? JSON.stringify(body) : undefined;
    return this.request<T>(path, { ...options, method: 'PUT', body: jsonBody });
  }

  patch<T = unknown, B = unknown>(path: string, body?: B, options: RequestOptions = {}) {
    const jsonBody = body !== undefined ? JSON.stringify(body) : undefined;
    return this.request<T>(path, { ...options, method: 'PATCH', body: jsonBody });
  }

  delete<T = unknown>(path: string, options: RequestOptions = {}) {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const http = new HttpClient();


