type SessionUser = {
  id?: string | null;
  email?: string | null;
  role?: string | null;
};

type SessionLike = {
  user?: SessionUser | null;
} | null | undefined;

const ADMIN_ROLES = new Set(["admin", "owner", "superadmin"]);

function parseAllowList(value: string | undefined): Set<string> {
  if (!value) return new Set();
  return new Set(
    value
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function getAdminAuthError(session: SessionLike): { status: number; error: string } | null {
  const user = session?.user;
  if (!user) {
    return { status: 401, error: "Unauthorized" };
  }

  const role = user.role?.toLowerCase();
  if (role && ADMIN_ROLES.has(role)) {
    return null;
  }

  const adminEmails = parseAllowList(process.env.ADMIN_EMAILS);
  const adminUserIds = parseAllowList(process.env.ADMIN_USER_IDS);

  if (adminEmails.size === 0 && adminUserIds.size === 0) {
    return {
      status: 500,
      error: "Admin access is not configured. Set ADMIN_EMAILS or ADMIN_USER_IDS.",
    };
  }

  const email = user.email?.toLowerCase();
  const userId = user.id?.toLowerCase();
  const isAdmin = (email && adminEmails.has(email)) || (userId && adminUserIds.has(userId));

  if (!isAdmin) {
    return { status: 403, error: "Forbidden" };
  }

  return null;
}
