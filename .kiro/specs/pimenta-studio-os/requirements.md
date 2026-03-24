# Documento de Requerimientos

## Introducción

Pimenta Studio OS es una aplicación web interna para una agencia digital. Permite gestionar clientes, cotizaciones, proyectos, finanzas, reuniones y equipo de trabajo. El sistema es monorganización, multiusuario (hasta 3 usuarios), y no es SaaS. El flujo principal es: Cliente → Cotización → Proyecto → Ingreso.

## Glosario

- **System**: La aplicación web Pimenta Studio OS
- **Auth_Module**: Módulo de autenticación y gestión de sesiones
- **User**: Miembro del equipo con rol `admin` o `member`
- **Client**: Empresa o persona que contrata servicios de la agencia
- **Quote**: Cotización formal con ítems de línea enviada a un cliente
- **QuoteItem**: Línea individual dentro de una cotización (descripción, cantidad, precio unitario)
- **Project**: Proyecto de trabajo vinculado a un cliente y opcionalmente a Jiraras y operativas del s clientes cuyo name o company contenga el texto ingresado (búsqueda case-insensitive).
2. WHEN un usuario ingresa texto en el campo de búsqueda de proyectos, THE System SHALL filtrar la lista mostrando solo los proyectos cuyo name contenga el texto ingresado (búsqueda case-insensitive).
gregar un meetingLink (URL) a cada Meeting.
7. WHEN un usuario accede a la lista de reuniones, THE System SHALL mostrar las reuniones ordenadas por dateTime descendente.

---

### Requerimiento 10: Búsqueda Básica

**User Story:** Como miembro del equipo, quiero buscar clientes y proyectos por nombre, para encontrar registros rápidamente sin navegar por toda la lista.

#### Criterios de Aceptación

1. WHEN un usuario ingresa texto en el campo de búsqueda de clientes, THE System SHALL filtrar la lista mostrando solo loype, clientId, dateTime, meetingLink, notes, createdAt.
2. THE System SHALL soportar los siguientes valores para `type` de Meeting: `internal`, `client`.
3. THE System SHALL gestionar la relación muchos-a-muchos entre Meeting y User mediante una tabla MeetingParticipant.
4. WHEN un usuario crea una reunión, THE System SHALL requerir: title, type y dateTime.
5. WHEN un usuario crea una reunión de tipo `client`, THE System SHALL permitir vincular la reunión a un Client existente.
6. THE System SHALL permitir acede al Dashboard, THE System SHALL mostrar la ganancia neta del mes en curso calculada como (total ingresos − total gastos).
4. WHEN un usuario accede al Dashboard, THE System SHALL mostrar el conteo de proyectos con status `active`.

---

### Requerimiento 9: Gestión de Reuniones

**User Story:** Como miembro del equipo, quiero crear reuniones y asignar participantes, para coordinar el trabajo interno y con clientes.

#### Criterios de Aceptación

1. THE System SHALL almacenar para cada Meeting: id, title, t requerir: description, amount, category y date.

---

### Requerimiento 8: Dashboard Financiero

**User Story:** Como miembro del equipo, quiero ver un resumen financiero del mes actual, para tener visibilidad rápida del estado económico de la agencia.

#### Criterios de Aceptación

1. WHEN un usuario accede al Dashboard, THE System SHALL mostrar el total de ingresos del mes en curso.
2. WHEN un usuario accede al Dashboard, THE System SHALL mostrar el total de gastos del mes en curso.
3. WHEN un usuario acTHE System SHALL registrar la fecha de pago.

---

### Requerimiento 7: Módulo Financiero — Gastos

**User Story:** Como administrador, quiero registrar gastos operativos categorizados, para conocer los costos de la agencia.

#### Criterios de Aceptación

1. THE System SHALL almacenar para cada Expense: id, description, amount, category, date.
2. THE System SHALL soportar los siguientes valores para `category`: `tools`, `marketing`, `salaries`, `other`.
3. WHEN un usuario registra un gasto, THE System SHALLagencia.

#### Criterios de Aceptación

1. THE System SHALL almacenar para cada Income: id, projectId, clientId, amount, status, date.
2. THE System SHALL soportar los siguientes valores para `status` de Income: `pending`, `paid`.
3. WHEN un usuario registra un ingreso, THE System SHALL requerir: projectId, clientId, amount y date.
4. WHEN un usuario registra un ingreso, THE System SHALL requerir que el Income esté vinculado a un Project existente.
5. WHEN un usuario cambia el status de un Income a `paid`, con el clientId de la Quote.
5. THE System SHALL permitir vincular un Project a una URL de Jira mediante el campo jiraUrl.
6. WHEN un usuario accede a la lista de proyectos, THE System SHALL permitir filtrar por status.
7. THE System SHALL permitir asignar un User responsable a cada Project mediante el campo assignedUserId.

---

### Requerimiento 6: Módulo Financiero — Ingresos

**User Story:** Como administrador, quiero registrar ingresos vinculados a proyectos, para llevar control del flujo de caja de la m SHALL almacenar para cada Project: id, name, clientId, assignedUserId, jiraUrl, status, budget, startDate, endDate, createdAt.
2. THE System SHALL soportar los siguientes valores para `status` de Project: `active`, `paused`, `completed`.
3. WHEN un usuario crea un proyecto manualmente, THE System SHALL requerir como mínimo: name, clientId y status.
4. WHEN un proyecto es creado desde una Quote aprobada, THE System SHALL pre-poblar name con el nombre del cliente, budget con el total de la Quote y clientId l de la Quote.
8. WHEN el status de una Quote cambia a `approved`, THE System SHALL establecer el status del nuevo Project como `active`.
9. IF una Quote tiene status `approved` o `rejected`, THEN THE System SHALL impedir modificar los QuoteItems de dicha Quote.

---

### Requerimiento 5: Gestión de Proyectos

**User Story:** Como miembro del equipo, quiero gestionar proyectos vinculados a clientes y a Jira, para hacer seguimiento del trabajo activo de la agencia.

#### Criterios de Aceptación

1. THE Syste`quantity × unitPrice`.
5. WHEN un usuario agrega, modifica o elimina un QuoteItem, THE System SHALL recalcular automáticamente el campo `total` de la Quote como la suma de todos los QuoteItem.total.
6. WHEN un usuario solicita exportar una cotización, THE PDF_Generator SHALL generar un documento PDF con: datos del cliente, lista de ítems, subtotales y total.
7. WHEN el status de una Quote cambia a `approved`, THE System SHALL crear automáticamente un Project vinculado al mismo clientId y con budget igual al totastas económicas y convertirlas en proyectos.

#### Criterios de Aceptación

1. THE System SHALL almacenar para cada Quote: id, clientId, total, status, createdAt.
2. THE System SHALL almacenar para cada QuoteItem: id, quoteId, description, quantity, unitPrice, total.
3. THE System SHALL soportar los siguientes valores para `status` de Quote: `draft`, `sent`, `approved`, `rejected`.
4. WHEN un usuario agrega o modifica un QuoteItem, THE System SHALL recalcular automáticamente el campo `total` del QuoteItem como elacionadas, proyectos relacionados, reuniones relacionadas e ingresos relacionados.
9. WHEN un usuario elimina un cliente, THE System SHALL realizar soft delete marcando el registro como inactivo en lugar de eliminarlo físicamente.
10. THE System SHALL permitir asignar un User responsable a cada Client mediante el campo assignedUserId.

---

### Requerimiento 4: Gestión de Cotizaciones

**User Story:** Como miembro del equipo, quiero crear cotizaciones con múltiples ítems para un cliente, para formalizar propueiority`: `high`, `medium`, `low`.
5. WHEN un usuario crea un cliente, THE System SHALL requerir como mínimo: name, email, status, type y priority.
6. WHEN un usuario accede a la lista de clientes, THE System SHALL mostrar todos los clientes en formato tabla con paginación.
7. WHEN un usuario aplica filtros, THE System SHALL filtrar la lista de clientes por status, type y/o priority simultáneamente.
8. WHEN un usuario accede al detalle de un cliente, THE System SHALL mostrar: información básica, cotizaciones rionar clientes, para mantener un registro centralizado de todos los clientes de la agencia.

#### Criterios de Aceptación

1. THE System SHALL almacenar para cada Client: id, name, company, email, phone, status, type, priority, assignedUserId, createdAt.
2. THE System SHALL soportar los siguientes valores para `status`: `lead`, `active`, `inactive`.
3. THE System SHALL soportar los siguientes valores para `type`: `web`, `system`, `marketing`, `other`.
4. THE System SHALL soportar los siguientes valores para `prsección de equipo, THE System SHALL mostrar la lista de todos los usuarios registrados.
3. WHERE el rol del usuario autenticado es `admin`, THE System SHALL permitir crear nuevos usuarios.
4. WHERE el rol del usuario autenticado es `admin`, THE System SHALL permitir editar nombre, email y rol de cualquier usuario.
5. THE System SHALL garantizar que el campo email de cada User sea único en la base de datos.

---

### Requerimiento 3: Gestión de Clientes

**User Story:** Como miembro del equipo, quiero crear y gestusuario con rol `member` intenta acceder a funciones exclusivas de `admin`, THE Auth_Module SHALL denegar el acceso.

---

### Requerimiento 2: Gestión de Equipo (Usuarios)

**User Story:** Como administrador, quiero gestionar los miembros del equipo, para controlar quién tiene acceso al sistema y asignarlos a clientes, proyectos y reuniones.

#### Criterios de Aceptación

1. THE System SHALL almacenar para cada User: id, name, email, password (hashed), role, createdAt.
2. WHEN un administrador accede a la lidas, THE Auth_Module SHALL rechazar el acceso y mostrar un mensaje de error.
3. WHEN un usuario no autenticado intenta acceder a una ruta protegida, THE Auth_Module SHALL redirigir al usuario a la página de login.
4. WHEN un usuario se autentica exitosamente, THE Auth_Module SHALL crear una sesión persistente y redirigir al Dashboard.
5. THE Auth_Module SHALL almacenar contraseñas usando un algoritmo de hash seguro (bcrypt).
6. THE System SHALL soportar dos roles de usuario: `admin` y `member`.
7. WHEN un mes actual
- **PDF_Generator**: Componente servidor que genera documentos PDF de cotizaciones

---

## Requerimientos

### Requerimiento 1: Autenticación de Usuarios

**User Story:** Como miembro del equipo, quiero iniciar sesión con email y contraseña, para acceder de forma segura a la aplicación.

#### Criterios de Aceptación

1. THE Auth_Module SHALL autenticar usuarios mediante email y contraseña con credenciales almacenadas en base de datos.
2. WHEN un usuario proporciona credenciales invá
- **Income**: Ingreso económico vinculado a un proyecto y cliente
- **Expense**: Gasto operativo de la agencia categorizado
- **Meeting**: Reunión interna o con cliente, con participantes asignados
- **Dashboard**: Vista resumen con métricas financie