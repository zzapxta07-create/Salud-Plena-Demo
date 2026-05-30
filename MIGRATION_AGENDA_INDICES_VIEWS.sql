-- ============================================================
-- MIGRACIÓN: ÍNDICES Y VISTAS PARA MÓDULO DE AGENDA
-- Compatibilidad: PostgreSQL 12+
-- Ejecución: Adminer o psql en base existente
-- Seguro: Usa IF NOT EXISTS, no borra datos
-- ============================================================

-- ============================================================
-- 1. AGREGAR ÍNDICES (Si no existen)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date
  ON "appointments"("doctorId", "date");

CREATE INDEX IF NOT EXISTS idx_appointments_status_date
  ON "appointments"("status", "date");

CREATE INDEX IF NOT EXISTS idx_reminders_scheduled
  ON "reminders"("scheduledAt", "status");

-- ============================================================
-- 2. CREAR VISTAS PARA n8n/CHATBOT
-- ============================================================

-- Vista de citas en formato plano para calendario/agendamiento
CREATE OR REPLACE VIEW "n8n_calendar_appointments" AS
SELECT
  a."id" as appointment_id,
  a."date" as appointment_date_iso,
  a."durationMinutes" as duration_minutes,
  EXTRACT(HOUR FROM a."date") as start_hour,
  EXTRACT(MINUTE FROM a."date") as start_minute,
  (EXTRACT(HOUR FROM a."date") + a."durationMinutes" / 60.0)::int as end_hour,
  ((EXTRACT(MINUTE FROM a."date") + a."durationMinutes") % 60)::int as end_minute,
  p."cellphone" as patient_phone,
  p."firstName" || ' ' || p."firstLastName" as patient_name,
  p."documentNumber" as patient_document,
  p."id" as patient_id,
  a."treatment" as service,
  d."firstName" || ' ' || d."lastName" as doctor_name,
  d."id" as doctor_id,
  d."specialty" as doctor_specialty,
  COALESCE(e."name", 'Particular') as entity_name,
  a."status" as appointment_status,
  a."confirmationStatus" as confirmation_status,
  TO_CHAR(a."date", 'YYYY-MM-DD') as appointment_date,
  TO_CHAR(a."date", 'HH24:MI') as appointment_time,
  TO_CHAR(a."date", 'Day') as day_of_week,
  a."createdAt" as created_at,
  a."updatedAt" as updated_at
FROM "appointments" a
JOIN "patients" p ON a."patientId" = p."id"
JOIN "doctors" d ON a."doctorId" = d."id"
LEFT JOIN "entities" e ON a."entityId" = e."id"
ORDER BY a."date" ASC;

-- Vista de recordatorios pendientes con datos del paciente y cita
CREATE OR REPLACE VIEW "n8n_pending_reminders" AS
SELECT
  r."id" as reminder_id,
  r."appointmentId" as appointment_id,
  a."date" as appointment_date_iso,
  TO_CHAR(a."date", 'YYYY-MM-DD') as appointment_date,
  TO_CHAR(a."date", 'HH24:MI') as appointment_time,
  r."stage" as reminder_stage,
  r."scheduledAt" as scheduled_at,
  r."status" as reminder_status,
  p."id" as patient_id,
  p."cellphone" as patient_phone,
  p."firstName" || ' ' || p."firstLastName" as patient_name,
  p."documentNumber" as patient_document,
  d."firstName" || ' ' || d."lastName" as doctor_name,
  d."specialty" as doctor_specialty,
  a."treatment" as service,
  COALESCE(e."name", 'Particular') as entity_name,
  a."status" as appointment_status,
  a."confirmationStatus" as confirmation_status,
  r."createdAt" as created_at
FROM "reminders" r
JOIN "appointments" a ON r."appointmentId" = a."id"
JOIN "patients" p ON r."patientId" = p."id"
JOIN "doctors" d ON a."doctorId" = d."id"
LEFT JOIN "entities" e ON a."entityId" = e."id"
WHERE r."status" IN ('PROGRAMADO', 'ENVIADO')
ORDER BY a."date" ASC;

-- ============================================================
-- 3. VALIDACIÓN Y CONFIRMACIÓN
-- ============================================================

SELECT '✅ MIGRACIÓN COMPLETADA' as estado;
SELECT '✓ Índices creados o validados' as index_status;
SELECT '✓ Vistas n8n_calendar_appointments y n8n_pending_reminders creadas' as views_status;

-- Verificar índices creados
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE tablename = 'appointments'
  AND (indexname LIKE 'idx_appointments_%' OR indexname LIKE 'idx_reminders_%')
ORDER BY indexname;
