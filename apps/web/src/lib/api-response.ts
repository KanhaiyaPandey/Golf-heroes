import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function unauthorized() {
  return error("Unauthorized", 401);
}

export function forbidden() {
  return error("Forbidden", 403);
}

export function notFound(resource = "Resource") {
  return error(`${resource} not found`, 404);
}

export function serverError(err: unknown) {
  console.error(err);
  if (err instanceof ZodError) {
    return error(err.errors.map((e) => e.message).join(", "), 422);
  }
  if (err instanceof Error) {
    if (err.message === "UNAUTHORIZED") return unauthorized();
    if (err.message === "FORBIDDEN") return forbidden();
    if (err.message === "SUBSCRIPTION_REQUIRED")
      return error("Active subscription required", 402);
  }
  return error("Internal server error", 500);
}
