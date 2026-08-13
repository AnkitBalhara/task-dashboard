export class ApiError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, message, details);
  }

  static notFound(message: string, details?: unknown): ApiError {
    return new ApiError(404, message, details);
  }

  static conflict(message: string, details?: unknown): ApiError {
    return new ApiError(409, message, details);
  }

  static internal(message: string, details?: unknown): ApiError {
    return new ApiError(500, message, details);
  }

  static badGateway(message: string, details?: unknown): ApiError {
    return new ApiError(502, message, details);
  }
}

export default ApiError;
