// lib/api/client.ts
import type { ApiResponse } from './response';
import type { ErrorCode } from './errors';

export type ApiClientError<TDetails = unknown> = {
  ok: false;
  status: number;
  code: ErrorCode | string; // string for safety until all routes are fully migrated
  message: string;
  details?: TDetails;
};

async function safeReadText(res: Response): Promise<string | null> {
  try {
    return await res.text();
  } catch {
    return null;
  }
}

export async function apiFetch<TData, TMeta = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<TData> {
  const res = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  let json: ApiResponse<TData, TMeta> | null = null;

  try {
    json = (await res.json()) as ApiResponse<TData, TMeta>;
  } catch {
    // If server didn't return JSON, normalize error
    const raw = await safeReadText(res);
    const err: ApiClientError = {
      ok: false,
      status: res.status,
      code: 'SERVER_ERROR',
      message: raw?.slice(0, 200) || 'Invalid JSON response from server',
    };
    throw err;
  }

  if (json && json.ok === true) {
    return json.data;
  }

  const err: ApiClientError = {
    ok: false,
    status: res.status,
    code: json?.error?.code ?? 'SERVER_ERROR',
    message: json?.error?.message ?? 'Request failed',
    details: json?.error?.details,
  };

  throw err;
}

