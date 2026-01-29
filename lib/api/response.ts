// lib/api/response.ts
import { NextResponse } from 'next/server';

export type ApiSuccess<TData = unknown, TMeta = unknown> = {
  ok: true;
  data: TData;
  meta?: TMeta;
};

export type ApiFailure<TDetails = unknown> = {
  ok: false;
  error: {
    code: string; // In Subtask 2 we'll lock this down to a union of explicit codes
    message: string;
    details?: TDetails;
  };
};

export type ApiResponse<TData = unknown, TMeta = unknown, TDetails = unknown> =
  | ApiSuccess<TData, TMeta>
  | ApiFailure<TDetails>;

export function success<TData, TMeta = unknown>(
  data: TData,
  status: number = 200,
  meta?: TMeta
) {
  const body: ApiSuccess<TData, TMeta> = meta === undefined ? { ok: true, data } : { ok: true, data, meta };
  return NextResponse.json(body, { status });
}

export function failure<TDetails = unknown>(
  code: string,
  message: string,
  status: number,
  details?: TDetails
) {
  const body: ApiFailure<TDetails> =
    details === undefined
      ? { ok: false, error: { code, message } }
      : { ok: false, error: { code, message, details } };

  return NextResponse.json(body, {
    status,
    headers: {
      // Explicit JSON + consistent behavior across handlers
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}
