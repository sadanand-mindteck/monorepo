import { FastifyError, FastifyInstance, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { DrizzleError, DrizzleQueryError } from "drizzle-orm";

// ----------------------
// Base App Error
// ----------------------
class AppError extends Error {
  public statusCode: number;
  public code?: string | number;
  public details?: unknown;

  constructor(message: string, statusCode = 500, code?: string | number, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ----------------------
// Specific Error Classes
// ----------------------
class ValidationAppError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

class DatabaseAppError extends AppError {
  constructor(message = "Database error", code?: string | number, details?: unknown) {
    super(message, 400, "DB_ERROR", details);
    this.code = code;
  }
}

class FileUploadAppError extends AppError {
  constructor(message = "File upload error", details?: unknown) {
    super(message, 400, "FILE_UPLOAD_ERROR", details);
  }
}

// ----------------------
// Error Response Shape
// ----------------------
interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  code?: string | number;
  details?: unknown;
  requestId: string;
}

// ----------------------
// Error Handler
// ----------------------
export function setupErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler((err: unknown, request: FastifyRequest, reply) => {
    request.log.error({ err, requestId: request.id }, "Error occurred");

    let appError: AppError;

    // 1. Zod validation
    if (err instanceof ZodError) {
      appError = new ValidationAppError("Invalid request data", err.issues);
    }
    // 2. Fastify schema validation
    else if ((err as FastifyError).validation) {
      appError = new ValidationAppError("Invalid request parameters", (err as FastifyError).validation);
    }
    // 3. Drizzle errors
    else if (err instanceof DrizzleError || err instanceof DrizzleQueryError) {
      appError = new DatabaseAppError(err.message, (err as any).code, (err as any).detail || err.cause);
    }
    // 4. Postgres constraint codes
    else if (typeof err === "object" && err !== null && "code" in err && ((err as any).code === "23505" || (err as any).code === "23503")) {
      appError = new DatabaseAppError((err as any).detail || (err as any).message, (err as any).code);
    }
    // 5. File upload errors
    else if (typeof err === "object" && err !== null && "code" in err && (err as any).code === "FST_FILES_LIMIT") {
      appError = new FileUploadAppError(`File size limit exceeded. Max allowed: ${process.env.MAX_FILE_SIZE || 10485760} bytes`);
    }
    // 6. Any other unexpected error
    else {
      const e = err as Error;
      appError = new AppError(
        process.env.NODE_ENV === "production" ? "Something went wrong" : e.message || "Unknown error",
        500,
        "INTERNAL_ERROR"
      );
    }

    // Construct response
    const response: ErrorResponse = {
      statusCode: appError.statusCode,
      error: appError.name,
      message: appError.message,
      code: appError.code,
      details: appError.details,
      requestId: request.id,
    };

    return reply.status(appError.statusCode).send(response);
  });
}
