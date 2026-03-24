# Documento de Diseño Técnico

## Visión General

Pimenta Studio OS es una aplicación web interna construida con Next.js App Router. La arquitectura sigue el patrón de Server Components para lectura de datos y Server Actions para mutaciones, minimizando el JavaScript del cliente. La base de datos es PostgreSQL gestionada con Prisma ORM.

## Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Estilos**: Tailwind CSS + ShadCN UI
- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: NextAuth.js v5 (credentials provider)
- **Generación PDF**: pdf-lib (server-side)
- **Validación**: Zod
- **Formularios**: React Hook Form + Zod resolver

---

## Estructura del Proyecto

```
pimenta-studio-os/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Layout con sidebar
│   │   ├── page.tsx                # Dashboard
│   │   ├── clients/
│   │   │   ├── page.tsx            # Lista de clientes
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Detalle cliente
│   │   │       └── edit/page.tsx
│   │   ├── quotes/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── finance/
│   │   │   ├── page.tsx            # Resumen + tabs income/expense
│   │   │   ├── income/new/page.tsx
│   │   │   └── expenses/new/page.tsx
│   │   ├── meetings/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   └── team/
│   │       ├── page.tsx
│   │       └── new/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       └── quotes/[id]/pdf/route.ts
├── components/
│   ├── ui/                         # ShadCN components
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   ├── clients/
│   ├── quotes/
│   ├── projects/
│   ├── finance/
│   ├── meetings/
│   └── team/
├── lib/
│   ├── auth.ts                     # NextAuth config
│   ├── prisma.ts                   # Prisma client singleton
│   ├── pdf.ts                      # PDF generation
│   └── utils.ts
├── actions/                        # Server Actions
│   ├── clients.ts
│   ├── quotes.ts
│   ├── projects.ts
│   ├── finance.ts
│   ├── meetings.ts
│   └── team.ts
├── prisma/
│   └── schema.prisma
└── middleware.ts                   # Protección de rutas
```

---

## Esquema de Base de Datos (Prisma)

```prisma
model User {
  id           String    @id @default(cuid())
  name         String
  email        String    @unique
  password     String
  role         Role      @default(member)
  createdAt    DateTime  @default(now())
  deletedAt    DateTime?

  assignedClients   Client[]
  assignedProjects  Project[]
  meetings          MeetingParticipant[]
}

enum Role {
  admin
  member
}

model Client {
  id             String        @id @default(cuid())
  name           String
  company        String?
  email          String
  phone          String?
  status         ClientStatus  @default(lead)
  type           ClientType
  priority       Priority
  assignedUserId String?
  createdAt      DateTime      @default(now())
  deletedAt      DateTime?

  assignedUser   User?         @relation(fields: [assignedUserId], references: [id])
  quotes         Quote[]
  projects       Project[]
  meetings       Meeting[]
  incomes        Income[]
}

enum ClientStatus { lead active inactive }
enum ClientType   { web system marketing other }
enum Priority     { high medium low }

model Quote {
  id        String      @id @default(cuid())
  clientId  String
  total     Decimal     @default(0)
  status    QuoteStatus @default(draft)
  createdAt DateTime    @default(now())

  client    Client      @relation(fields: [clientId], references: [id])
  items     QuoteItem[]
  project   Project?
}

enum QuoteStatus { draft sent approved rejected }

model QuoteItem {
  id          String  @id @default(cuid())
  quoteId     String
  description String
  quantity    Int
  unitPrice   Decimal
  total       Decimal

  quote       Quote   @relation(fields: [quoteId], references: [id], onDelete: Cascade)
}

model Project {
  id             String        @id @default(cuid())
  name           String
  clientId       String
  assignedUserId String?
  quoteId        String?       @unique
  jiraUrl        String?
  status         ProjectStatus @default(active)
  budget         Decimal?
  startDate      DateTime?
  endDate        DateTime?
  createdAt      DateTime      @default(now())
  deletedAt      DateTime?

  client         Client        @relation(fields: [clientId], references: [id])
  assignedUser   User?         @relation(fields: [assignedUserId], references: [id])
  quote          Quote?        @relation(fields: [quoteId], references: [id])
  incomes        Income[]
}

enum ProjectStatus { active paused completed }

model Income {
  id        String       @id @default(cuid())
  projectId String
  clientId  String
  amount    Decimal
  status    IncomeStatus @default(pending)
  date      DateTime
  paidAt    DateTime?
  createdAt DateTime     @default(now())

  project   Project      @relation(fields: [projectId], references: [id])
  client    Client       @relation(fields: [clientId], references: [id])
}

enum IncomeStatus { pending paid }

model Expense {
  id          String          @id @default(cuid())
  description String
  amount      Decimal
  category    ExpenseCategory
  date        DateTime
  createdAt   DateTime        @default(now())
}

enum ExpenseCategory { tools marketing salaries other }

model Meeting {
  id          String      @id @default(cuid())
  title       String
  type        MeetingType
  clientId    String?
  dateTime    DateTime
  meetingLink String?
  notes       String?
  createdAt   DateTime    @default(now())

  client       Client?              @relation(fields: [clientId], references: [id])
  participants MeetingParticipant[]
}

enum MeetingType { internal client }

model MeetingParticipant {
  meetingId String
  userId    String

  meeting   Meeting @relation(fields: [meetingId], references: [id], onDelete: Cascade)
  user      User    @relation(fields: [userId], references: [id])

  @@id([meetingId, userId])
}
```

---

## Diseño de Componentes Clave

### Autenticación (NextAuth)

- Provider: `CredentialsProvider` con validación Zod
- Estrategia de sesión: JWT
- Middleware protege todas las rutas bajo `/(dashboard)`
- El campo `role` se incluye en el token JWT y en la sesión

```ts
// lib/auth.ts — estructura
export const authOptions = {
  providers: [CredentialsProvider({ ... })],
  callbacks: {
    jwt({ token, user }) { /* agregar role al token */ },
    session({ session, token }) { /* agregar role a session.user */ }
  }
}
```

### Server Actions

Todas las mutaciones se implementan como Server Actions en `/actions/`. Patrón estándar:

```ts
// actions/clients.ts
'use server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const CreateClientSchema = z.object({ ... })

export async function createClient(data: unknown) {
  const parsed = CreateClientSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten() }
  const client = await prisma.client.create({ data: parsed.data })
  revalidatePath('/clients')
  return { data: client }
}
```

### Flujo Quote → Project (Acción Crítica)

```ts
// actions/quotes.ts
export async function approveQuote(quoteId: string) {
  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id: quoteId },
    include: { client: true }
  })

  await prisma.$transaction([
    prisma.quote.update({
      where: { id: quoteId },
      data: { status: 'approved' }
    }),
    prisma.project.create({
      data: {
        name: quote.client.name,
        clientId: quote.clientId,
        quoteId: quote.id,
        budget: quote.total,
        status: 'active',
        startDate: new Date()
      }
    })
  ])

  revalidatePath('/quotes')
  revalidatePath('/projects')
}
```

### Generación de PDF

```ts
// app/api/quotes/[id]/pdf/route.ts
// GET handler que genera PDF server-side con pdf-lib
// Retorna Response con Content-Type: application/pdf
```

### Soft Delete

Los modelos `User`, `Client` y `Project` tienen campo `deletedAt`. Todas las queries de listado incluyen `where: { deletedAt: null }`.

---

## Flujos de Datos por Módulo

### Dashboard
- Server Component que ejecuta 4 queries en paralelo con `Promise.all`
- Filtra por mes actual usando `gte`/`lte` en fechas

### Lista de Clientes con Filtros
- URL params: `?status=active&type=web&priority=high&q=texto`
- Server Component lee searchParams y construye el `where` de Prisma dinámicamente

### Formulario de Cotización
- Client Component con React Hook Form
- Items dinámicos con `useFieldArray`
- Cálculo de totales en tiempo real en el cliente
- Submit via Server Action

---

## Seguridad

- Contraseñas hasheadas con `bcrypt` (salt rounds: 12)
- Rutas protegidas por middleware de NextAuth
- Validación de inputs con Zod en todas las Server Actions
- Verificación de rol en acciones exclusivas de admin
- Variables de entorno para `DATABASE_URL`, `NEXTAUTH_SECRET`

---

## Variables de Entorno

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pimenta_studio"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```
