---
name: 2026-06-03-recordatorios-bd-real-n8n-flujo
type: session
area: frontend, backend, database
date: 2026-06-03
author: claude
status: active
tags: [reminders, n8n, whatsapp, typescript, bug-fix, prisma, mock-data]
related: [[2026-06-01-reminders-espejo-n8n-trigger], [2026-05-27-api-routes-prisma-migration]]
sources: [repo:src/app/recordatorios/page.tsx, repo:prisma/seed.ts, repo:src/components/ui/status-badge.tsx, repo:src/app/api/patients/[id]/route.ts, repo:src/app/api/reminders/route.ts, repo:src/app/pacientes/[id]/page.tsx, repo:src/app/page.tsx, repo:src/lib/mock-data.ts]
---

# Recordatorios conectados a BD real + fixes TypeScript + flujo n8n

## Contexto

Sesión de continuación tras el refactor de reminders del 2026-06-01. Tres bloques de trabajo:
1. **Vercel deploy fallaba** con errores TypeScript porque `prisma/seed.ts` y varios archivos usaban campos del modelo Reminder viejo (`stage`, `status`, `patientReply`, etc.) que ya no existen en el schema.
2. **La página `/recordatorios` mostraba datos de mock-data** aunque n8n ya había actualizado registros reales en la BD — los cambios no se reflejaban.
3. **MIGRACION_REMINDERS.sql** falló con errores al ejecutarse en Adminer; se resolvieron en caliente con SQL parcheado.

---

## Trabajo realizado

### Fix TypeScript — deploy Vercel roto

Errores tras `prisma generate`:

| Archivo | Error | Fix |
|---|---|---|
| `prisma/seed.ts` | `stage`, `scheduledAt`, `sentAt`, `status`, `patientReply` no existen | Reemplazados por campos nuevos: `estadoRecordatorio`, `startIso`, `endIso`, etc. |
| `src/components/ui/status-badge.tsx` | `ReminderStatus` no existe en types | Cambiado a `ReminderEstado`; mapa actualizado a 6 estados nuevos |
| `src/app/api/patients/[id]/route.ts` | `reminders` no existe en `PatientInclude` | Eliminado del include (Patient ya no tiene relación directa con Reminder) |
| `src/app/api/reminders/route.ts` | `patient` no existe en `ReminderInclude` | Eliminado del include (Reminder no tiene FK directo a Patient) |
| `src/app/pacientes/[id]/page.tsx` | `reminders` no existe en include de Patient | Eliminado; `patientReminders` queda como array vacío por ahora |
| `src/app/page.tsx` | `status: "PROGRAMADO"` y `status: "NO_RESPONDE"` en where de Reminder | Cambiados a `estadoRecordatorio: "PENDIENTE"` y `estadoRecordatorio: "NO_RESPONDE"` |

Commits: `44273cd`, `4eecd40`

### /recordatorios conectada a BD real

`src/app/recordatorios/page.tsx` reemplazó `import { reminders } from "@/lib/mock-data"` por `useEffect` + `fetch('/api/reminders')`.

El mapping snake_case → camelCase se hace inline en el `.then()`:
```ts
start_iso → startIso
estado_recordatorio → estadoRecordatorio
ultimo_recordatorio_tipo → ultimoRecordatorioTipo
// etc.
```

Commit: `ee5e691`

### Fixes en BD (Adminer) — MIGRACION_REMINDERS.sql

Errores encontrados al ejecutar la migración y soluciones aplicadas:

| Error | Causa | Fix |
|---|---|---|
| `null value in column "stage"` | Columna vieja `"stage"` tenía NOT NULL sin default | `ALTER TABLE "reminders" ALTER COLUMN "stage" DROP NOT NULL` |
| `null value in column "appointmentId"` | Columna vieja `"appointmentId"` tenía NOT NULL | `ALTER COLUMN "appointmentId" DROP NOT NULL` |
| `Key (appointment_id)=(apt-angel) not present in "Appointment"` | La cita apt-angel nunca se insertó en "Appointment" | INSERT manual de apt-angel en "Appointment"; trigger creó el reminder automáticamente |

### Cita Angel Zapata — fecha actualizada

- Mock-data: `addHoursToDay(addDays(1), 15)` → `setTime("2026-06-03", 16, 0)` (fija el 3 de junio a las 16:00)
- BD: UPDATE en `"Appointment"` y `reminders` vía trigger

### Cita de prueba n8n — tres horas

Insertada `apt-3h-test` (2026-06-02 21:45, "Consulta general", sin patientId/doctorId) para validar que `n8n_reminders_three_hours_due` la detecta exactamente dentro de la ventana de 3 horas.

---

## Decisiones

| Decisión | Rationale |
|---|---|
| **Mapping snake_case inline en fetch** (no en API) | La API devuelve columnas tal como las retorna Prisma (ya mapeadas a camelCase por `@map`). El mapping extra en el `.then()` cubre columnas sin `@map` explícito en el modelo viejo. |
| **`patientReminders = []` en pacientes/[id]** | Patient ya no tiene relación directa con Reminder. En el futuro, los reminders del paciente se obtendrán via `/api/reminders?patientId=X`. |
| **ALTER COLUMN DROP NOT NULL** en lugar de DROP COLUMN | Las columnas viejas (`stage`, `appointmentId`, etc.) tienen índices y FKs existentes; dropearlas requeriría cascade y mayor riesgo. Hacerlas nullable es más seguro. |

### Flujo n8n — campos a actualizar al enviar recordatorio

Después de enviar el **primer recordatorio (DIA_ANTES)**:
```sql
UPDATE reminders SET
  estado_recordatorio      = 'ENVIADO',
  ultimo_recordatorio_tipo = 'DIA_ANTES',
  day_before_sent_at       = NOW(),
  updated_at               = NOW()
WHERE appointment_id = '{{id}}';
```

Después de enviar el **segundo recordatorio (TRES_HORAS)**:
```sql
UPDATE reminders SET
  estado_recordatorio      = 'ENVIADO',
  ultimo_recordatorio_tipo = 'TRES_HORAS',
  three_hours_sent_at      = NOW(),
  updated_at               = NOW()
WHERE appointment_id = '{{id}}';
```

---

## Output

### Commits
- `44273cd` — Fix tipos Reminder en seed, APIs, status-badge, dashboard
- `4eecd40` — Cita Angel Zapata → 2026-06-03 16:00
- `ee5e691` — Conectar /recordatorios a BD real via /api/reminders

### Archivos modificados
- `prisma/seed.ts`
- `src/components/ui/status-badge.tsx`
- `src/app/api/patients/[id]/route.ts`
- `src/app/api/reminders/route.ts`
- `src/app/pacientes/[id]/page.tsx`
- `src/app/page.tsx`
- `src/app/recordatorios/page.tsx`
- `src/lib/mock-data.ts`

### SQL ejecutado en Adminer (BD Vercel)
- DROP NOT NULL en columnas viejas de `reminders`
- INSERT `apt-angel` en `"Appointment"` (trigger creó `rem-apt-angel`)
- UPDATE `apt-angel` fechas → 2026-06-03 16:00
- INSERT `apt-3h-test` → 2026-06-02 21:45 (prueba vista TRES_HORAS)

---

## Pendientes

| Tarea | Estado | Bloqueador |
|---|---|---|
| Verificar `/recordatorios` en Vercel muestra datos reales con estados ENVIADO | ⏳ pendiente | Deploy en curso |
| Conectar `pacientes/[id]` para mostrar reminders del paciente vía API | ⏳ pendiente | Requiere endpoint `/api/reminders?patientId=X` |
| Probar flujo completo n8n: SELECT vista → UPDATE enviado → respuesta paciente | ⏳ pendiente | n8n en configuración |
| Limpiar `apt-3h-test` de BD cuando ya no se necesite para pruebas | ⏳ pendiente | Ninguno |

---

## Cross-refs

- [[2026-06-01-reminders-espejo-n8n-trigger]] — nodo padre: define el schema, trigger, vistas y modelo Reminder que se corrigió en esta sesión
- [[2026-05-27-api-routes-prisma-migration]] — APIs y seed.ts que se actualizaron para reflejar el nuevo modelo
