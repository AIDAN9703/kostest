/**
 * API Route Response Utilities
 * For use in app/api routes (not server actions)
 * 
 * Server actions should use ActionResponse from @/shared/types/types
 */

import { NextResponse } from 'next/server';

/**
 * Success response with data
 * Usage: return apiSuccess(user)
 */
export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Success response with data and metadata
 * Usage: return apiSuccessWithMeta(users, { pagination: {...} })
 */
export function apiSuccessWithMeta<T>(
  data: T,
  meta: Record<string, any>,
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    { status }
  );
}

/**
 * Paginated response helper
 * Usage: return apiPaginated(users, { page: 1, limit: 10, totalCount: 100, totalPages: 10 })
 */
export function apiPaginated<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  },
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: { pagination },
    },
    { status }
  );
}

/**
 * Error response
 * Usage: return apiError("User not found", 404)
 */
export function apiError(error: string, status: number = 500) {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

/**
 * Success response without data (for DELETE, etc.)
 * Usage: return apiSuccessNoData("User deleted")
 */
export function apiSuccessNoData(message: string = "Success", status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
    },
    { status }
  );
}

