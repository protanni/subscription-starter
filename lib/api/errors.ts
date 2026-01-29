// lib/api/errors.ts

export const ERROR_CODES = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    CONFLICT: 'CONFLICT',
    SERVER_ERROR: 'SERVER_ERROR',
    SUPABASE_ERROR: 'SUPABASE_ERROR',
  } as const;
  
  export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
  
  export const ERROR_STATUS: Record<ErrorCode, number> = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 400,
    CONFLICT: 409,
    SERVER_ERROR: 500,
    SUPABASE_ERROR: 502, // use 500 if you prefer; we standardize 502 to signal upstream dependency failure
  } as const;
  