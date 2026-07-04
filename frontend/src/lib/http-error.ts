/**
 * Normalized API error, mirroring the backend error envelope
 * (docs/api/api-standards.md §6). All API failures surface as an ApiError so
 * UI code has one predictable error shape to handle.
 */
export interface ApiErrorShape {
  /** Stable machine code, e.g. "VALIDATION_FAILED", "FORBIDDEN". */
  code: string;
  /** Human-readable, safe-to-display message. */
  message: string;
  /** Field-keyed validation errors (422). */
  details?: Record<string, string[]>;
  /** HTTP status (0 = network/no response). */
  status: number;
  /** Correlates with backend logs. */
  requestId?: string;
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: Record<string, string[]>;
  readonly requestId?: string;

  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.name = "ApiError";
    this.code = shape.code;
    this.status = shape.status;
    this.details = shape.details;
    this.requestId = shape.requestId;
  }

  /** Field-level validation errors (422), safe to map onto form fields. */
  get fieldErrors(): Record<string, string[]> {
    return this.details ?? {};
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }

  get isUnauthenticated(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }
}
