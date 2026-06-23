export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors: Array<{ field?: string; message: string }>;
  traceId: string;
}

export function successResponse<T>(
  message: string,
  data: T,
  meta?: Record<string, unknown>,
): SuccessResponse<T> {
  return meta ? { success: true, message, data, meta } : { success: true, message, data };
}
