import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Si está en /login y ya tiene sesión → redirige al dashboard
  if (pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Si no tiene sesión y no está en /login → redirige al login
  if (!isLoggedIn && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Aplica a todas las rutas excepto assets estáticos y API de auth
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}
