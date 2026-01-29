// lib/api/handler.ts
import { NextResponse } from 'next/server';
import { failure } from './response';
import { ERROR_CODES, ERROR_STATUS } from './errors';

type ApiHandler = (req: Request) => Promise<NextResponse>;

export function withApiHandler(handler: ApiHandler) {
  return async (req: Request): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (err) {
      console.error('[API ERROR]', err);

      return failure(
        ERROR_CODES.SERVER_ERROR,
        'Unexpected server error',
        ERROR_STATUS.SERVER_ERROR
      );
    }
  };
}
