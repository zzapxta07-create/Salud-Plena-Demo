# Índice — Salud Plena Demo

Organización temática del wiki. Cada bullet es un nodo. Format: `[[slug]] — one-liner`.

---

## Backend

- [[2026-06-03-recordatorios-bd-real-n8n-flujo]] — /recordatorios conectada a BD real; fixes TypeScript Prisma; flujo n8n DIA_ANTES/TRES_HORAS documentado
- [[2026-06-01-reminders-espejo-n8n-trigger]] — Reminders como espejo operativo de appointments para n8n/WhatsApp + trigger PostgreSQL
- [[2026-05-27-api-routes-prisma-migration]] — Crear 11 endpoints REST y migrar datos hardcodeados a BD real

---

## Database

- [[2026-06-01-reminders-espejo-n8n-trigger]] — Nuevo modelo Reminder espejo, trigger sync, 4 vistas n8n, MIGRACION_REMINDERS.sql
- [[2026-05-27-api-routes-prisma-migration]] — Schema Prisma completo, fix Evolution reference, gen client

---

## DevOps

- [[2026-05-27-deploy-vercel-postgres]] — Deploy a Vercel con BD PostgreSQL remota (72.61.7.36:15432)

---

## Frontend

- [[2026-06-03-recordatorios-bd-real-n8n-flujo]] — /recordatorios migrada de mock-data a fetch real; status-badge ReminderEstado
- [[2026-06-01-reminders-espejo-n8n-trigger]] — Página /recordatorios reescrita con tabs por estadoRecordatorio
- [[2026-05-29-patient-selector-context]] — Selector de paciente global con Context API
- [[2026-05-27-api-routes-prisma-migration]] — Client Components con useEffect + fetch a APIs

---

## Architecture

- [[2026-05-27-api-routes-prisma-migration]] — Patrón híbrido: Server Components usan Prisma directo, Client Components hacen fetch a APIs
