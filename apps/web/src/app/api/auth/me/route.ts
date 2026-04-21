import { getSession } from "@/lib/auth/session";
import { ok, unauthorized } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();
  return ok(session);
}
