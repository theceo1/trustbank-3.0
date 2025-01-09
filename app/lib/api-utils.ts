import { NextResponse } from 'next/server';

export class APIError extends Error {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.name = 'APIError';
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  
  if (error instanceof APIError) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: error.status }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: (error as any).status || 500 }
    );
  }

  return NextResponse.json(
    { status: 'error', message: 'An unexpected error occurred' },
    { status: 500 }
  );
} 