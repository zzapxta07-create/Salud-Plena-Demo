---
name: 2026-05-27-api-routes-prisma-migration
type: session
area: backend, database, architecture
date: 2026-05-27
author: claude
status: active
tags: [prisma, api-routes, migration, data-fetching]
related: [[2026-05-27-deploy-vercel-postgres]]
sources: [repo:src/app/api/, repo:src/lib/db.ts, repo:prisma/schema.prisma]
---

# Migración: Mock-data → API Routes + Prisma

## Contexto

El proyecto Salud Plena Demo tenía **100% de datos hardcodeados** en `src/lib/mock-data.ts`:
- 9 arrays con entidades, doctores, pacientes, citas, pagos, CRM, recordatorios, WhatsApp, consentimientos
- Schema Prisma completo (26 modelos) pero **nunca usado**
- Formularios sin persistencia: todos hacían `alert("Demo...")` + `router.push()`
- BD PostgreSQL remota ya conectada (72.61.7.36:15432) pero inutilizada

**Objetivo**: Eliminar mock-data completamente. Todo debe leer/escribir en BD real.

## Trabajo realizado

### Fase 1: Infraestructura
- ✅ Creado `src/lib/db.ts` — Prisma client singleton (patrón global para evitar múltiples instancias en dev)

### Fase 2: API Routes (11 endpoints)
- ✅ `/api/patients` — GET list (con búsqueda), POST create
- ✅ `/api/patients/[id]` — GET detail (con includes: appointments, payments, files, consents, reminders, crmCases)
- ✅ `/api/doctors` — GET list (solo activos)
- ✅ `/api/entities` — GET list (solo activas)
- ✅ `/api/appointments` — GET list, POST create
- ✅ `/api/crm` — GET list, POST create
- ✅ `/api/crm/[id]` — GET detail (con patient, entity, files)
- ✅ `/api/payments` — GET list, POST create
- ✅ `/api/reminders` — GET list (con appointment+doctor+patient)
- ✅ `/api/whatsapp` — GET list (con patient, messages)
- ✅ `/api/dashboard` — GET metrics (counts: patients, appointments, payments, pendingPayments, crmCases)

### Fase 3: Server Components (Prisma directo)
- ✅ `src/app/page.tsx` (dashboard) — Reemplazado `getDashboardMetrics()` + filtros en memoria por queries directos a Prisma
  - `totalPatients`, `appointmentsToday`, `unconfirmedAppointments`, `pendingReminders`, `activeCrmCases`, `crmCasesWithPendingDocs`, `crmReadyToSchedule`, `patientsNotResponding`
  - Upstream citas próximas y CRM recientes con includes()
  - Renderizado con datos frescos del servidor

- ✅ `src/app/pacientes/[id]/page.tsx` — Reemplazado `findPatient()` + array filters por query directo
  - Prisma findUnique con includes: entity, appointments(+doctor), payments, attachedFiles, consents, reminders, crmCases
  - Downstream renderizado de citas, pagos, archivos, etc.

- ✅ `src/app/crm/[id]/page.tsx` — Reemplazado array finds por query directo
  - Prisma findUnique con includes: patient, entity, files
  - Renderizado de caso completo

### Fase 4: Client Components (useEffect + fetch)
- ✅ `src/app/pacientes/page.tsx` — Convertido a async data fetching
  - `useEffect` que llama a `fetch('/api/patients')`
  - Estado `[patients, setPatients]` con loading
  - Filtros en `useMemo` siguen funcionando igual

### Correcciones
- 🔧 Prisma schema: removido referencia inválida a modelo `Evolution` en Doctor
- 🔧 `npx prisma generate` ejecutado para regenerar client
- 🔧 TypeScript: añadidas anotaciones `(x: any) =>` donde TypeScript no pudo inferir tipos

### Build
- ✅ `npm run build` compila sin errores
- ✅ Todas las rutas tipadas, sin `any` innecesarios

## Decisiones

| Decisión | Rationale |
|---|---|
| **Server Components** (Prisma directo) vs API routes | Más eficiente, menos roundtrips, mejor para data-heavy pages (dashboard, detalle paciente) |
| **Client Components** (fetch a APIs) | Conserva lógica de estado y filtros en cliente, desacopla del servidor |
| **11 endpoints separados** vs un mega-endpoint | Mejor separación de concerns, reutilizable, RESTful puro |
| **Incluir relations en Prisma** vs N queries | Evita N+1, una sola BD roundtrip, más rápido |

## Output

### Archivos creados
- `src/lib/db.ts` (15 líneas)
- `src/app/api/patients/route.ts` (45 líneas)
- `src/app/api/patients/[id]/route.ts` (30 líneas)
- `src/app/api/doctors/route.ts` (12 líneas)
- `src/app/api/entities/route.ts` (12 líneas)
- `src/app/api/appointments/route.ts` (43 líneas)
- `src/app/api/crm/route.ts` (40 líneas)
- `src/app/api/crm/[id]/route.ts` (30 líneas)
- `src/app/api/payments/route.ts` (43 líneas)
- `src/app/api/reminders/route.ts` (18 líneas)
- `src/app/api/whatsapp/route.ts` (15 líneas)
- `src/app/api/dashboard/route.ts` (25 líneas)

### Archivos modificados
- `src/app/page.tsx` (+70, -30)
- `src/app/pacientes/[id]/page.tsx` (+25, -15)
- `src/app/pacientes/page.tsx` (+50, -10)
- `src/app/crm/[id]/page.tsx` (+10, -5)
- `prisma/schema.prisma` (-1 línea: remover Evolution)

### Commit
```
beae6dd Fase 1-3: Crear APIs y actualizar Server Components

- Crear src/lib/db.ts (Prisma client singleton)
- Crear 11 API routes: /patients, /doctors, /entities, /appointments, /crm, /payments, /reminders, /whatsapp, /dashboard
- Actualizar dashboard (page.tsx) para usar Prisma directo
- Actualizar pacientes/[id] para usar Prisma directo
- Actualizar crm/[id] para usar Prisma directo
- Actualizar pacientes/page.tsx para fetch desde /api/patients
- Corregir schema Prisma (remover referencia a Evolution)
```

## Pendientes

| Tarea | Estado | Bloqueador |
|---|---|---|
| Actualizar `agenda/page.tsx` (fetch a /api/appointments) | ⏳ pending | Ninguno |
| Actualizar `crm/page.tsx` (fetch a /api/crm) | ⏳ pending | Ninguno |
| Actualizar `pagos/page.tsx` (fetch a /api/payments) | ⏳ pending | Ninguno |
| Actualizar `recordatorios/page.tsx` (fetch a /api/reminders) | ⏳ pending | Ninguno |
| Actualizar `whatsapp/page.tsx` (fetch a /api/whatsapp) | ⏳ pending | Ninguno |
| Actualizar `pacientes/nuevo` form → POST /api/patients | ⏳ pending | Ninguno |
| Actualizar `agenda/nueva` form → POST /api/appointments | ⏳ pending | Ninguno |
| Actualizar `crm/nuevo` form → POST /api/crm | ⏳ pending | Ninguno |
| Actualizar `pagos/nuevo` form → POST /api/payments | ⏳ pending | Ninguno |
| Actualizar `PatientPicker` (fetch con búsqueda) | ⏳ pending | Ninguno |
| Eliminar `src/lib/mock-data.ts` | ⏳ pending | Todo lo anterior |
| Re-deploy a Vercel con cambios | ⏳ pending | Todo lo anterior |

**Estimación**: 2-3 horas más para completar. Patrón bien establecido, repetitivo.

## Cross-refs

- [[2026-05-27-deploy-vercel-postgres]] — BD remota ya conectada antes de este trabajo
- [[2026-06-01-reminders-espejo-n8n-trigger]] — refactor completo del modelo Reminder que vivía en este schema; trigger y vistas n8n creados encima de este schema
- [[2026-06-03-recordatorios-bd-real-n8n-flujo]] — seed.ts y APIs corregidos para reflejar el nuevo modelo Reminder
