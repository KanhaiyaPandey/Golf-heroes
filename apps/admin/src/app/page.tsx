import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function AdminRoot() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");
  redirect("/dashboard");
}
