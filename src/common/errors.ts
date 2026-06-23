export class AppError extends Error {
  readonly statusCode: number;
  readonly details?: Array<{ field?: string; message: string }>;

  constructor(
    message: string,
    statusCode = 400,
    details?: Array<{ field?: string; message: string }>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}
