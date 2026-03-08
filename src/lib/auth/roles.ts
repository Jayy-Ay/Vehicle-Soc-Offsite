export type Role = 'admin' | 'manager' | 'viewer'

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  manager: 'Manager',
  viewer: 'Viewer',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  admin: 'Full platform control',
  manager: 'Fleet and alert management',
  viewer: 'Read-only analyst access',
}

export const hasRequiredRole = (userRole: Role | undefined, allowedRoles?: Role[]) => {
  if (!allowedRoles || allowedRoles.length === 0) return true
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}
