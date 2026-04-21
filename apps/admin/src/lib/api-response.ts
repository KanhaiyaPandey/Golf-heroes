import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const ok = <T>(data: T, status = 200) =>
  NextResponse.json({ success: true, data }, { status });
export const error = (message: string, status = 400) =>
  NextResponse.json({ success: false, error: message }, { status });
export const unauthorized = () => error("Unauthorized", 401);
export const forbidden = () => error("Forbidden", 403);
export const notFound = (r = "Resource") => error(`${r} not found`, 404);
export const serverError = (err: unknown) => {
  console.error(err);
  if (err instanceof ZodError) return error(err.errors.map((e) => e.message).join(", "), 422);
  if (err instanceof Error) {
    if (err.message === "UNAUTHORIZED") return unauthorized();
    if (err.message === "FORBIDDEN") return forbidden();
  }
  return error("Internal server error", 500);
};
