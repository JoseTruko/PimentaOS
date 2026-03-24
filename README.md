# Pimenta Studio OS

Sistema de gestión interna para agencia digital que permite gestionar clientes, cotizaciones, proyectos, finanzas, reuniones y equipo de trabajo.

## Stack Tecnológico

- **Framework**: Next.js 16.2.1 (App Router)
- **Estilos**: Tailwind CSS v4 + ShadCN UI (Nova preset)
- **TypeScript**: Configurado con tipos estrictos
- **Componentes**: Radix UI + Class Variance Authority
- **Iconos**: Lucide React

## Estructura del Proyecto

```
pimenta-studio-os/
├── app/                    # App Router (Next.js 16)
│   ├── globals.css        # Estilos globales con Tailwind CSS v4
│   ├── layout.tsx         # Layout raíz
│   └── page.tsx           # Página principal
├── components/
│   └── ui/                # Componentes ShadCN UI
│       └── button.tsx     # Componente Button
├── lib/
│   └── utils.ts           # Utilidades (cn function)
├── actions/               # Server Actions (preparado)
├── prisma/                # Prisma ORM (preparado)
└── public/                # Archivos estáticos
```

## Comandos Disponibles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Producción
npm start

# Linting
npm run lint
```

## Configuración Completada

### ✅ Tarea 1.1: Inicialización del Proyecto

- [x] Proyecto Next.js 16.2.1 con App Router
- [x] Tailwind CSS v4 configurado
- [x] ShadCN UI instalado y configurado (preset Nova)
- [x] Estructura básica del proyecto creada
- [x] TypeScript configurado
- [x] Página de bienvenida implementada

### Próximos Pasos

La tarea 1.1 está completa. Las siguientes tareas incluyen:

1. **Tarea 1.2**: Configurar PostgreSQL y Prisma
2. **Tarea 1.3**: Crear singleton del cliente Prisma
3. **Tarea 1.4**: Configurar NextAuth con CredentialsProvider
4. **Tarea 1.5**: Crear layout principal con sidebar
5. **Tarea 1.6**: Crear página de login
6. **Tarea 1.7**: Crear script de seed

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Características Técnicas

- **App Router**: Utiliza las últimas características de React 19
- **Server Components**: Por defecto para mejor rendimiento
- **Tailwind CSS v4**: Con variables CSS nativas y mejor DX
- **ShadCN UI**: Componentes accesibles y personalizables
- **TypeScript**: Tipado estricto para mejor DX
- **Estructura Modular**: Preparada para escalabilidad
