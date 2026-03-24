import 'server-only'
import { auth } from '@/lib/auth'
import { cache } from 'react'

export const verifySession = cache(async () => {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }

  return {
    user: {
      id: session.user.id!,
      name: session.user.name!,
      email: session.user.email!,
      role: session.user.role as 'admin' | 'member',
    }
  }
})