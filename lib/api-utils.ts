// lib/api-utils.ts

import { NextResponse } from 'next/server';

export class APIError extends Error {
    constructor(
      message: string,
      public status: number,
      public code?: string
    ) {
      super(message);
      this.name = 'APIError';
    }
  }
  
  export async function handleAPIError(error: unknown) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }
  
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
  
  export function validateQueryParams(params: Record<string, string | null>, required: string[]) {
    const missing = required.filter(param => !params[param]);
    if (missing.length > 0) {
      throw new APIError(
        `Missing required parameters: ${missing.join(', ')}`,
        400,
        'MISSING_PARAMS'
      );
    }
  }