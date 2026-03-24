# Plan de Implementación

## Etapa 1: Fundación del Proyecto

- [x] 1.1 Inicializar proyecto Next.js con App Router, Tailwind CSS y ShadCN UI
- [x] 1.2 Configurar PostgreSQL y Prisma: instalar dependencias, crear `prisma/schema.prisma` con todos los modelos y enums, ejecutar migración inicial
- [x] 1.3 Crear `lib/prisma.ts` con el singleton del cliente Prisma
- [x] 1.4 Configurar NextAuth con CredentialsProvider: crear `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts` y `middleware.ts` para proteger rutas
- [x] 1.5 Crear layout principal con sidebar de navegación: `app/(dashboard)/layout.tsx`, `components/layout/sidebar.tsx` y `components/layout/header.tsx`
- [x] 1.6 Crear página de login: `app/(auth)/login/page.tsx` con formulario email/password
- [x] 1.7 Crear script de seed con usuario admin inicial: `prisma/seed.ts`

## Etapa 2: Módulo de Clientes

- [x] 2.1 Crear Server Actions para clientes: `actions/clients.ts` con `createClient`, `updateClient`, `deleteClient` (soft delete) y `getClients`
- [x] 2.2 Crear página de lista de clientes con tabla, filtros por status/type/priority y búsqueda por nombre: `app/(dashboard)/clients/page.tsx`
- [x] 2.3 Crear formulario de creación/edición de cliente como componente reutilizable: `components/clients/client-form.tsx`
- [x] 2.4 Crear páginas `new` y `edit` de cliente usando el formulario compartido
- [x] 2.5 Crear página de detalle de cliente con tabs: info, cotizaciones, proyectos, reuniones, ingresos: `app/(dashboard)/clients/[id]/page.tsx`

## Etapa 3: Módulo de Cotizaciones

- [ ] 3.1 Crear Server Actions para cotizaciones: `actions/quotes.ts` con `createQuote`, `updateQuote`, `addQuoteItem`, `removeQuoteItem`, `changeQuoteStatus` y `approveQuote` (transacción quote → project)
- [ ] 3.2 Crear componente de formulario de cotización con ítems dinámicos y cálculo de totales en tiempo real: `components/quotes/quote-form.tsx`
- [ ] 3.3 Crear página de lista de cotizaciones: `app/(dashboard)/quotes/page.tsx`
- [ ] 3.4 Crear páginas `new` y `edit` de cotización
- [ ] 3.5 Crear página de detalle de cotización con botones de cambio de status: `app/(dashboard)/quotes/[id]/page.tsx`
- [ ] 3.6 Implementar generación de PDF server-side: `lib/pdf.ts` con pdf-lib y `app/api/quotes/[id]/pdf/route.ts`

## Etapa 4: Módulo de Proyectos

- [ ] 4.1 Crear Server Actions para proyectos: `actions/projects.ts` con `createProject`, `updateProject` y `getProjects`
- [ ] 4.2 Crear página de lista de proyectos con filtro por status: `app/(dashboard)/projects/page.tsx`
- [ ] 4.3 Crear formulario de creación/edición de proyecto: `components/projects/project-form.tsx`
- [ ] 4.4 Crear páginas `new` y detalle de proyecto: `app/(dashboard)/projects/new/page.tsx` y `app/(dashboard)/projects/[id]/page.tsx`

## Etapa 5: Módulo Financiero

- [ ] 5.1 Crear Server Actions para ingresos y gastos: `actions/finance.ts` con `createIncome`, `markIncomePaid`, `createExpense` y `getFinanceSummary`
- [ ] 5.2 Crear página de finanzas con tabs (Ingresos / Gastos / Resumen): `app/(dashboard)/finance/page.tsx`
- [ ] 5.3 Crear formulario de registro de ingreso vinculado a proyecto: `components/finance/income-form.tsx`
- [ ] 5.4 Crear formulario de registro de gasto con categoría: `components/finance/expense-form.tsx`

## Etapa 6: Dashboard

- [ ] 6.1 Implementar queries del dashboard: total ingresos del mes, total gastos del mes, ganancia neta y conteo de proyectos activos (con `Promise.all`)
- [ ] 6.2 Crear página de dashboard con tarjetas de métricas: `app/(dashboard)/page.tsx`

## Etapa 7: Módulo de Reuniones

- [ ] 7.1 Crear Server Actions para reuniones: `actions/meetings.ts` con `createMeeting`, `updateMeeting` y `getMeetings`
- [ ] 7.2 Crear página de lista de reuniones ordenada por fecha: `app/(dashboard)/meetings/page.tsx`
- [ ] 7.3 Crear formulario de reunión con selección de participantes y cliente opcional: `components/meetings/meeting-form.tsx`
- [ ] 7.4 Crear página `new` de reunión: `app/(dashboard)/meetings/new/page.tsx`

## Etapa 8: Módulo de Equipo

- [ ] 8.1 Crear Server Actions para usuarios: `actions/team.ts` con `createUser`, `updateUser` y `getUsers` (solo admin)
- [ ] 8.2 Crear página de lista del equipo: `app/(dashboard)/team/page.tsx`
- [ ] 8.3 Crear formulario de creación/edición de usuario con validación de rol: `components/team/user-form.tsx`
- [ ] 8.4 Crear página `new` de usuario: `app/(dashboard)/team/new/page.tsx`
