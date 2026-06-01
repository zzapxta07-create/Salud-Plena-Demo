-- ============================================================
-- MIGRACIÓN PARA BD EXISTENTE — Appointments n8n-compatible
-- Ejecutar contra la BD activa (tabla "Appointment" PascalCase)
-- ============================================================

-- ============================================================
-- 1. AGREGAR COLUMNAS NUEVAS A "Appointment"
--    (sin borrar datos existentes)
-- ============================================================
ALTER TABLE "Appointment"
  ADD COLUMN IF NOT EXISTS "phone"                TEXT,
  ADD COLUMN IF NOT EXISTS "name"                 TEXT,
  ADD COLUMN IF NOT EXISTS "servicio"             TEXT,
  ADD COLUMN IF NOT EXISTS "especialista_nombre"  TEXT,
  ADD COLUMN IF NOT EXISTS "fecha_texto_original" TEXT,
  ADD COLUMN IF NOT EXISTS "start_iso"            TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "end_iso"              TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "fecha_iso_dia"        DATE,
  ADD COLUMN IF NOT EXISTS "dia_texto"            TEXT,
  ADD COLUMN IF NOT EXISTS "estado_cita"          TEXT NOT NULL DEFAULT 'pendiente';

-- Hacer patientId / doctorId opcionales (necesario para citas n8n sin paciente previo)
ALTER TABLE "Appointment"
  ALTER COLUMN "patientId" DROP NOT NULL,
  ALTER COLUMN "doctorId"  DROP NOT NULL;

-- ============================================================
-- 2. POBLAR COLUMNAS NUEVAS DESDE DATOS EXISTENTES
-- ============================================================
UPDATE "Appointment" a
SET
  "start_iso"            = a."date",
  "end_iso"              = a."date" + (a."durationMinutes" * INTERVAL '1 minute'),
  "fecha_iso_dia"        = a."date"::DATE,
  "dia_texto"            = CASE EXTRACT(DOW FROM a."date")
                             WHEN 0 THEN 'domingo'  WHEN 1 THEN 'lunes'
                             WHEN 2 THEN 'martes'   WHEN 3 THEN 'miércoles'
                             WHEN 4 THEN 'jueves'   WHEN 5 THEN 'viernes'
                             ELSE 'sábado'
                           END,
  "servicio"             = a."treatment",
  "fecha_texto_original" = TO_CHAR(a."date", 'DD/MM/YYYY HH24:MI'),
  "estado_cita"          = LOWER(a."status"::TEXT),
  "name"                 = CONCAT(p."firstName", ' ', p."firstLastName"),
  "phone"                = COALESCE(p."cellphone", p."phone"),
  "especialista_nombre"  = CONCAT('Dr(a). ', d."firstName", ' ', d."lastName")
FROM "Patient" p, "Doctor" d
WHERE a."patientId" = p."id"
  AND a."doctorId"  = d."id"
  AND a."start_iso" IS NULL;

-- Filas sin patientId / doctorId (mínimo: start_iso desde date)
UPDATE "Appointment"
SET
  "start_iso"     = "date",
  "end_iso"       = "date" + ("durationMinutes" * INTERVAL '1 minute'),
  "fecha_iso_dia" = "date"::DATE,
  "dia_texto"     = CASE EXTRACT(DOW FROM "date")
                      WHEN 0 THEN 'domingo'  WHEN 1 THEN 'lunes'
                      WHEN 2 THEN 'martes'   WHEN 3 THEN 'miércoles'
                      WHEN 4 THEN 'jueves'   WHEN 5 THEN 'viernes'
                      ELSE 'sábado'
                    END,
  "servicio"      = "treatment",
  "estado_cita"   = LOWER("status"::TEXT)
WHERE "start_iso" IS NULL;

-- ============================================================
-- 3. HACER NOT NULL start_iso, end_iso, fecha_iso_dia
--    (solo después de poblar todos los datos)
-- ============================================================
ALTER TABLE "Appointment"
  ALTER COLUMN "start_iso"      SET NOT NULL,
  ALTER COLUMN "end_iso"        SET NOT NULL,
  ALTER COLUMN "fecha_iso_dia"  SET NOT NULL;

-- ============================================================
-- 4. ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS "idx_appointments_start_iso"
  ON "Appointment" ("start_iso");

CREATE INDEX IF NOT EXISTS "idx_appointments_end_iso"
  ON "Appointment" ("end_iso");

CREATE INDEX IF NOT EXISTS "idx_appointments_fecha_iso_dia"
  ON "Appointment" ("fecha_iso_dia");

CREATE INDEX IF NOT EXISTS "idx_appointments_phone"
  ON "Appointment" ("phone");

CREATE INDEX IF NOT EXISTS "idx_appointments_estado_cita"
  ON "Appointment" ("estado_cita");

CREATE INDEX IF NOT EXISTS "idx_appointments_doctor_start"
  ON "Appointment" ("doctorId", "start_iso");

-- ============================================================
-- 5. VISTA: appointment_calendar_events
--    Formato plano para n8n / calendario
-- ============================================================
DROP VIEW IF EXISTS "appointment_calendar_events";
CREATE VIEW "appointment_calendar_events" AS
SELECT
  a."id"                                                     AS "appointment_id",
  COALESCE(a."phone", p."cellphone", p."phone", '')          AS "phone",
  COALESCE(a."name",  CONCAT(p."firstName",' ',p."firstLastName"), '') AS "name",
  COALESCE(a."servicio", a."treatment", '')                  AS "servicio",
  COALESCE(a."especialista_nombre",
           CONCAT('Dr(a). ', d."firstName", ' ', d."lastName")) AS "especialista_nombre",
  COALESCE(a."fecha_texto_original",
           TO_CHAR(a."start_iso",'DD/MM/YYYY HH24:MI'))      AS "fecha_texto_original",
  a."start_iso",
  a."end_iso",
  EXTRACT(EPOCH FROM (a."end_iso" - a."start_iso"))::INT / 60 AS "duration_minutes",
  a."fecha_iso_dia",
  a."dia_texto",
  a."estado_cita",
  a."status",
  a."confirmationStatus"                                      AS "confirmation_status",
  a."patientId"                                               AS "patient_id",
  a."doctorId"                                                AS "doctor_id",
  a."entityId"                                                AS "entity_id"
FROM "Appointment" a
LEFT JOIN "Patient" p ON p."id" = a."patientId"
LEFT JOIN "Doctor"  d ON d."id" = a."doctorId";

-- ============================================================
-- 6. VISTA: n8n_pending_reminders
--    Recordatorios pendientes de envío para automatizaciones n8n
-- ============================================================
DROP VIEW IF EXISTS "n8n_pending_reminders";
CREATE VIEW "n8n_pending_reminders" AS
SELECT
  r."id"                                                     AS "reminder_id",
  r."appointmentId"                                          AS "appointment_id",
  COALESCE(a."phone", p."cellphone", p."phone", '')          AS "phone",
  COALESCE(a."name",  CONCAT(p."firstName",' ',p."firstLastName"), '') AS "name",
  COALESCE(a."servicio", a."treatment", '')                  AS "servicio",
  COALESCE(a."especialista_nombre",
           CONCAT('Dr(a). ', d."firstName", ' ', d."lastName")) AS "especialista_nombre",
  a."start_iso",
  a."end_iso",
  r."stage"                                                  AS "reminder_type",
  r."scheduledAt"                                            AS "scheduled_at",
  r."status",
  'whatsapp'                                                 AS "channel"
FROM "Reminder" r
JOIN "Appointment" a ON a."id" = r."appointmentId"
LEFT JOIN "Patient" p ON p."id" = r."patientId"
LEFT JOIN "Doctor"  d ON d."id" = a."doctorId"
WHERE r."status" IN ('PROGRAMADO', 'ENVIADO');

-- ============================================================
-- 7. INSERT DEMO para prueba n8n (cita sin paciente formal)
-- ============================================================
INSERT INTO "Appointment" (
  "id", "phone", "name", "servicio", "especialista_nombre",
  "fecha_texto_original", "start_iso", "end_iso",
  "fecha_iso_dia", "dia_texto", "estado_cita",
  "date",
  "status", "confirmationStatus", "createdAt", "updatedAt"
)
SELECT
  'apt-n8n-demo',
  '+57 300 000 0001',
  'Paciente Demo n8n',
  'Consulta general',
  'Dr(a). Laura Castillo',
  TO_CHAR(NOW() + INTERVAL '1 day 10 hours', 'DD/MM/YYYY HH24:MI'),
  DATE_TRUNC('day', NOW()) + INTERVAL '1 day 10 hours',
  DATE_TRUNC('day', NOW()) + INTERVAL '1 day 11 hours',
  (DATE_TRUNC('day', NOW()) + INTERVAL '1 day')::DATE,
  CASE EXTRACT(DOW FROM NOW() + INTERVAL '1 day')
    WHEN 0 THEN 'domingo' WHEN 1 THEN 'lunes'
    WHEN 2 THEN 'martes'  WHEN 3 THEN 'miércoles'
    WHEN 4 THEN 'jueves'  WHEN 5 THEN 'viernes'
    ELSE 'sábado'
  END,
  'pendiente',
  DATE_TRUNC('day', NOW()) + INTERVAL '1 day 10 hours',
  'AGENDADA', 'PENDIENTE', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Appointment" WHERE "id" = 'apt-n8n-demo'
);
