import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">401</h1>
          <h2 className="text-xl font-semibold text-foreground">No autorizado</h2>
          <p className="text-muted-foreground">
            Necesitas iniciar sesión para acceder a esta página.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/login">
              Iniciar Sesión
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              Volver al Inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}