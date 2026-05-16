import type { User } from "../hooks/useAuth";

const SUPERADMIN_EMAILS = new Set([
  "pbaker@smbx.ai",
  "paul.preview@smbx.ai",
]);

export function isSuperAdminUser(
  user: { email: string; role?: User["role"] } | null | undefined,
): boolean {
  if (!user) return false;
  const role = user.role?.toLowerCase();
  const email = user.email?.toLowerCase();
  return role === "superadmin" || role === "admin" || SUPERADMIN_EMAILS.has(email);
}
