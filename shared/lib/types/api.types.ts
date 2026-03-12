/**
 * Standardized API Response Types
 * Used for type-safe API client functions
 */

/**
 * Standard API response structure
 * All API routes should return this format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * API response with metadata (e.g., pagination)
 */
export interface ApiResponseWithMeta<T = any> extends ApiResponse<T> {
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    };
    [key: string]: any;
  };
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T = any> {
  success: boolean;
  data: T[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    };
  };
  error?: string;
}

