export type AppErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "TOO_MANY_REQUESTS"
  | "DATABASE_UNAVAILABLE"
  | "INTERNAL";

const STATUS_BY_CODE: Record<AppErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  DATABASE_UNAVAILABLE: 503,
  INTERNAL: 500,
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;

  constructor(code: AppErrorCode, message: string, status = STATUS_BY_CODE[code]) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export type ActionResult<T = undefined> =
  | ({ ok: true; message?: string } & (T extends undefined ? object : { data: T }))
  | { ok: false; message: string; code: AppErrorCode; status: number };

export function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof AppError) {
    return {
      ok: false,
      message: error.message,
      code: error.code,
      status: error.status,
    };
  }

  throw error;
}

export function actionSuccess<T>(
  data: T,
  message?: string,
): ActionResult<T> {
  return { ok: true, data, message } as ActionResult<T>;
}

export function actionMessage(message: string): ActionResult {
  return { ok: true, message };
}

export function toApiResponse(error: unknown) {
  if (error instanceof AppError) {
    return Response.json(
      {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.status },
    );
  }

  throw error;
}
