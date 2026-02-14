import type { H3Event } from 'h3';

const ROLE_HIERARCHY: Record<string, number> = {
  Admin: 4,
  Manager: 3,
  Staff: 2,
  ReadOnly: 1,
};

export async function requireRole(event: H3Event, ...allowedRoles: string[]) {
  const session = await getAuthSession(event);
  if (!session.data.userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const user = await User.findById(session.data.userId).select('role');
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'User not found',
    });
  }

  const userRole = user.role || 'Staff';
  if (!allowedRoles.includes(userRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Forbidden: requires ${allowedRoles.join(' or ')} role`,
    });
  }

  return userRole;
}

export function getRoleLevel(role: string): number {
  return ROLE_HIERARCHY[role] || 0;
}
