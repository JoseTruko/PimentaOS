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


## Características Técnicas

- **App Router**: Utiliza las últimas características de React 19
- **Server Components**: Por defecto para mejor rendimiento
- **Tailwind CSS v4**: Con variables CSS nativas y mejor DX
- **ShadCN UI**: Componentes accesibles y personalizables
- **TypeScript**: Tipado estricto para mejor DX
- **Estructura Modular**: Preparada para escalabilidad
