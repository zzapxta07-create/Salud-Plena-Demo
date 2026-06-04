---
name: 2026-06-01-reminders-espejo-n8n-trigger
type: session
area: database, backend, frontend
date: 2026-06-01
author: claude
status: active
tags: [reminders, n8n, whatsapp, trigger, postgresql, espejo, migration, appointments]
related: [[2026-05-27-api-routes-prisma-migration], [2026-05-27-deploy-vercel-postgres]]
sources: [repo:prisma/schema.prisma, repo:src/lib/types.ts, repo:src/lib/mock-data.ts, repo:src/app/recordatorios/page.tsx, repo:src/app/page.tsx, repo:salud_plena_demo_full_seed.sql, repo:MIGRACION_REMINDERS.sql]
---

# Reminders: Espejo Operativo de Appointments para n8n/WhatsApp

## Contexto

La tabla `reminders` existente era un sistema de recordatorios genérico con enums (`ReminderStage`, `ReminderStatus`) desconectado del flujo real de WhatsApp/n8n. El objetivo fue convertirla en un **espejo operativo plano** de `appointments`, con exactamente **2 recordatorios por cita** (1 día antes y 3 horas antes), que n8n puede leer y actualizar sin necesitar JOINs ni conocer IDs de paciente o doctor.

Además, se resolvieron dos bugs críticos que rompían el dashboard en producción.

---

## Trabajo realizado

### Bug fix 1: `Appointment.duration_minutes` no existe en BD
- `prisma/schema.prisma` tenía `durationMinutes Int? @map("duration_minutes")` pero la columna real en BD es `durationMinutes` (camelCase, sin renombre).
- Fix: eliminar `@map("duration_minutes")`.
- Commit: `c82a70a`

### Bug fix 2: `Cannot read properties of null (reading 'firstName')` en dashboard
- El dashboard hacía `a.doctor.firstName` y `a.patient.firstName` directamente, pero ambas relaciones son opcionales (citas creadas por n8n no tienen `doctorId`/`patientId`).
- Fix: null-safe access: `a.doctor ? \`${a.doctor.firstName}...\` : (a.especialistaNombre ?? "—")`.
- También: queries de dashboard cambiadas de campo `date` a `startIso` (fuente de verdad).
- Commit: `b74eab6`

### Refactor completo del sistema de Reminders

#### `prisma/schema.prisma`
- Eliminados enums: `ReminderStage { TRES_DIAS UN_DIA DOS_HORAS }` y `ReminderStatus { PROGRAMADO ENVIADO ... }`
- Eliminada relación `reminders Reminder[]` de `Patient` (Reminder ya no tiene FK directo a Patient)
- Nuevo modelo `Reminder` con `@@map("reminders")`:
  - Campos espejo planos: `phone`, `name`, `servicio`, `especialistaNombre`, `startIso`, `endIso`, `fechaIsoDia`, `diaTexto`, `estadoCita`
  - Flujo: `estadoRecordatorio String @default("PENDIENTE")`, `ultimoRecordatorioTipo String?`
  - Timestamps de envío: `dayBeforeSentAt`, `threeHoursSentAt`, `respondedAt`, `noResponseCheckedAt`
  - Respuesta: `responseText`, `channel @default("WHATSAPP")`
  - Relación opcional: `appointment Appointment? @relation(onDelete: SetNull)`

#### `src/lib/types.ts`
- Reemplazados tipos obsoletos por:
  ```typescript
  export type ReminderEstado = "PENDIENTE" | "ENVIADO" | "CONFIRMADO" | "NO_RESPONDE" | "REAGENDAR" | "CANCELADO";
  export type ReminderTipo = "DIA_ANTES" | "TRES_HORAS";
  export interface Reminder { ... } // espejo plano de Appointment
  ```

#### `src/lib/mock-data.ts`
- Agregado paciente **Angel Zapata** (pat-6, CC 1109548694, nacido 2007-11-28, PARTICULAR, celular 3053427529) — DEMO
- Agregada cita `apt-angel`: 2026-06-02 15:00–16:00, "Valoración inicial", Dr. Laura Castillo
- Helper `mkReminder(apt, overrides)`: crea reminder espejo desde un Appointment
- 9 reminders de demo cubriendo los 6 estados: CONFIRMADO, ENVIADO, CANCELADO, PENDIENTE (×3), NO_RESPONDE, REAGENDAR
- Fix en `getDashboardMetrics`: `r.status === "PROGRAMADO"` → `r.estadoRecordatorio === "PENDIENTE"` y `r.status === "NO_RESPONDE"` → `r.estadoRecordatorio === "NO_RESPONDE"`

#### `src/app/recordatorios/page.tsx`
- Reescritura completa con tabs por `estadoRecordatorio` (6 tabs con conteo)
- Tabla: Paciente, Teléfono, Cita/Servicio, Especialista, Tipo recordatorio, Inicio cita, Estado, Respuesta, Acción
- `TIPO_LABELS`: `DIA_ANTES` → "Un día antes", `TRES_HORAS` → "Tres horas antes"
- Acciones contextuales: "Reagendar" en REAGENDAR, "Contactar" en NO_RESPONDE, "Enviar ya" en PENDIENTE
- Panel de info con 3 notas (flujo, regla crítica, respuestas del paciente)

#### `salud_plena_demo_full_seed.sql` (seed fresh)
- Nueva `CREATE TABLE reminders` snake_case con `UNIQUE(appointment_id)`
- Trigger `sync_appointment_to_reminder()` + `AFTER INSERT` y `AFTER UPDATE ON appointments`
- Eliminado INSERT manual de reminders; estados se setean con UPDATE después del INSERT (el trigger los crea)
- 4 vistas n8n:
  - `n8n_reminders_day_before_due` — pendientes de enviar DIA_ANTES (ventana: 23h50m–24h10m antes)
  - `n8n_reminders_three_hours_due` — pendientes de enviar TRES_HORAS (ventana: 2h55m–3h5m antes)
  - `n8n_reminders_no_response_due` — ENVIADO sin respuesta > 2h después de envío
  - `appointment_calendar_events` — todos los eventos para calendario
- Índices en `appointments` (start_iso, fecha_iso_dia, estado_cita) y `reminders` (appointment_id, estado_recordatorio, start_iso)
- Angel Zapata y apt-angel agregados

#### `MIGRACION_REMINDERS.sql` (nuevo archivo para BD existente PascalCase)
- Renombra tabla `"Reminder"` → `"reminders"` de forma segura (DO $$ ... IF NOT EXISTS)
- `ADD COLUMN IF NOT EXISTS` para todos los campos nuevos
- Migra datos de columnas camelCase antiguas → snake_case nuevas
- Popula campos espejo desde JOIN con tabla `"Appointment"`
- Mapea estados viejos: `PROGRAMADO`→`PENDIENTE`, `REAGENDAMIENTO_SOLICITADO`→`REAGENDAR`
- Agrega `UNIQUE(appointment_id)` y FK a `"Appointment"`
- Crea reminders faltantes para todas las citas sin espejo
- Crea el trigger function `sync_appointment_to_reminder()` y ambos triggers
- Crea las 4 vistas n8n apuntando a tablas PascalCase (`"Appointment"`, `"Patient"`, `"Doctor"`)
- Inserta Angel Zapata y apt-angel con `WHERE NOT EXISTS` (idempotente)

---

## Decisiones

| Decisión | Rationale |
|---|---|
| **Espejo plano** (campos duplicados en reminders) | n8n puede hacer SELECT/UPDATE sin JOINs. Simplicidad operativa. |
| **Exactamente 2 recordatorios por cita** (DIA_ANTES + TRES_HORAS) | Regla de negocio explícita. No 3 días, no 2 horas. |
| **Trigger PostgreSQL** (no job de n8n) | El reminder se crea automáticamente en el instante de la cita, sin intervención manual. |
| **`UNIQUE(appointment_id)`** en reminders | Garantiza 1 reminder por cita. `ON CONFLICT DO NOTHING` evita duplicados si el trigger se ejecuta dos veces. |
| **`estadoRecordatorio` separado de `estadoCita`** | El estado del recordatorio puede diferir del estado de la cita. Permite trackear el flujo de confirmación sin tocar la cita. |
| **`startIso`/`endIso` como fuente de verdad** | Campo `date` + `durationMinutes` son legado. n8n y el frontend usan `startIso`/`endIso`. |
| **`@@map("reminders")`** en Prisma | BD Vercel (PascalCase) usa `"Reminder"`; seed fresh usa `"reminders"`. El `@@map` hace que Prisma apunte a lowercase sin rename de migración. |
| **TRES_HORAS (no DOS_HORAS)** | El usuario lo aclaró explícitamente: "No son 2 horas antes. Es obligatorio que sea 3 horas antes." |

---

## Output

### Commits
- `c82a70a` — Fix @map durationMinutes
- `b74eab6` — Fix null patient/doctor en dashboard + queries startIso
- `d0bddd5` — Refactor reminders: espejo operativo de appointments para n8n/WhatsApp (push a GitHub → Vercel deploy automático)

### Archivos creados
- `MIGRACION_REMINDERS.sql` — migración segura para BD existente PascalCase

### Archivos modificados
- `prisma/schema.prisma` — nuevo modelo Reminder
- `src/lib/types.ts` — ReminderEstado, ReminderTipo, interface Reminder
- `src/lib/mock-data.ts` — Angel Zapata, apt-angel, mkReminder, 9 reminders demo
- `src/app/recordatorios/page.tsx` — reescritura completa
- `src/app/page.tsx` — null-safe relations, queries con startIso
- `salud_plena_demo_full_seed.sql` — tabla, trigger, vistas, índices

### Vistas n8n disponibles tras migración
```sql
SELECT * FROM n8n_reminders_day_before_due;       -- pendientes de 1er recordatorio
SELECT * FROM n8n_reminders_three_hours_due;       -- pendientes de 2do recordatorio
SELECT * FROM n8n_reminders_no_response_due;       -- sin respuesta > 2h
SELECT * FROM appointment_calendar_events;          -- todos los eventos
```

---

## Pendientes

| Tarea | Estado | Bloqueador |
|---|---|---|
| Ejecutar `MIGRACION_REMINDERS.sql` en Adminer (BD Vercel) | ⏳ pendiente | Usuario debe ejecutarlo manualmente |
| Verificar Angel Zapata en Adminer | ⏳ pendiente | Después de migración |
| Verificar vistas n8n con SELECT en Adminer | ⏳ pendiente | Después de migración |
| Conectar `/api/reminders` al nuevo modelo (usa `estadoRecordatorio`) | ⏳ pendiente | Ninguno |
| Eliminar `src/lib/mock-data.ts` (página recordatorios ya no la usa) | ⏳ pendiente | Otras páginas aún dependen |

---

## Cross-refs

- [[2026-05-27-api-routes-prisma-migration]] — esquema Prisma base donde vivía el modelo Reminder anterior; API `/api/reminders` creada ahí
- [[2026-05-27-deploy-vercel-postgres]] — BD remota PostgreSQL (72.61.7.36:15432) donde debe ejecutarse MIGRACION_REMINDERS.sql
- [[2026-06-03-recordatorios-bd-real-n8n-flujo]] — sesión de continuación: fixes TypeScript, /recordatorios conectada a BD, errores de migración resueltos en Adminer
