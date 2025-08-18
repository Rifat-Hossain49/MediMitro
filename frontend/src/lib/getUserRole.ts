import { auth } from '@/auth'
import type { Role } from './roles'

export async function getCurrentUserRole(): Promise<Role | null> {
  const session = await auth()
  if (!session?.user) return null
  return (session.user.role as Role | undefined) ?? 'patient'
}

export async function requireRole(allowedRoles: Role[]): Promise<{ role: Role; userId: string }> {
  const session = await auth()
  if (!session?.user) throw new Error('UNAUTHENTICATED')
  
  const role = (session.user.role as Role | undefined) ?? 'patient'
  if (!allowedRoles.includes(role)) {
    throw new Error('UNAUTHORIZED')
  }
  return { role, userId: session.user.id }
}



