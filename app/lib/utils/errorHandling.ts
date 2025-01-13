"use client";

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { QuidaxError } from '@/app/lib/services/quidax';

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof QuidaxError) {
    return NextResponse.json(
      { status: 'error', message: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { status: 'error', message: 'Validation error', errors: error.errors },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { status: 'error', message: 'An unexpected error occurred' },
    { status: 500 }
  );
}