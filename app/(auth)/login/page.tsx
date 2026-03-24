import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panel izquierdo — branding */}
      <div className="hidden lg:flex flex-col justify-between bg-sidebar p-12">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">P</span>
          </div>
          <span className="text-sidebar-foreground font-semibold text-lg">Pimenta Studio</span>
        </div>

        <div className="space-y-4">
          <blockquote className="text-sidebar-foreground/80 text-lg leading-relaxed">
            "Gestiona clientes, cotizaciones y proyectos desde un solo lugar. Tu agencia, organizada."
          </blockquote>
          <p className="text-sidebar-foreground/50 text-sm">— Pimenta Studio OS</p>
        </div>

        <div className="flex gap-6 text-sidebar-foreground/40 text-xs">
          <span>Clientes</span>
          <span>Cotizaciones</span>
          <span>Proyectos</span>
          <span>Finanzas</span>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo mobile */}
          <div className="flex lg:hidden items-center gap-3 justify-center">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">P</span>
            </div>
            <span className="font-semibold text-lg">Pimenta Studio</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Bienvenido de vuelta</h1>
            <p className="text-muted-foreground text-sm">
              Ingresa tus credenciales para acceder al panel
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-xs text-muted-foreground">
            Sistema de gestión interna · Pimenta Studio
          </p>
        </div>
      </div>
    </div>
  )
}
