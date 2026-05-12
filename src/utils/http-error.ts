export class HttpError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(statusCode: number, message: string, code = "HTTP_ERROR", details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function notFound(message = "Resource not found") {
  return new HttpError(404, message, "NOT_FOUND");
}

export function badRequest(message: string, details?: unknown) {
  return new HttpError(400, message, "BAD_REQUEST", details);
}
