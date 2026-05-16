export const SUPERADMIN_EMAILS = new Set(['pbaker@smbx.ai']);

export function isSuperAdminUser(user: { email?: string | null; role?: string | null } | null | undefined): boolean {
  if (!user) return false;
  const role = user.role?.toLowerCase();
  const email = user.email?.toLowerCase();
  return role === 'superadmin' || role === 'admin' || Boolean(email && SUPERADMIN_EMAILS.has(email));
}
