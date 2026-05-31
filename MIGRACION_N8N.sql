-- ============================================================
-- MIGRACIÓN PARA BD EXISTENTE — N8N / CHATBOT
-- Ejecutar en Adminer o psql contra la BD postgres
-- Autor: Salud Plena Demo
-- ============================================================

-- ============================================================
-- 1. TABLA PLANA PARA CHATBOT / N8N
-- ============================================================
CREATE TABLE IF NOT EXISTS "n8n_appointments" (
  "id"                   TEXT        PRIMARY KEY,
  "phone"                TEXT        NOT NULL,
  "name"                 TEXT        NOT NULL,
  "servicio"             TEXT        NOT NULL,
  "especialista_nombre"  TEXT,
  "fecha_texto_original" TEXT,
  "start_iso"            TIMESTAMP   NOT NULL,
  "end_iso"              TIMESTAMP   NOT NULL,
  "duration_minutes"     INTEGER     NOT NULL DEFAULT 30,
  "fecha_iso_dia"        DATE        NOT NULL,
  "dia_texto"            TEXT,
  "estado_cita"          TEXT        NOT NULL DEFAULT 'pendiente',
  "appointment_id"       TEXT,
  "patient_id"           TEXT,
  "doctor_id"            TEXT,
  "entity_id"            TEXT,
  "created_at"           TIMESTAMP   NOT NULL DEFAULT NOW(),
  "updated_at"           TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_n8n_appt_phone
  ON "n8n_appointments" ("phone");

CREATE INDEX IF NOT EXISTS idx_n8n_appt_start_iso
  ON "n8n_appointments" ("start_iso");

CREATE INDEX IF NOT EXISTS idx_n8n_appt_fecha_iso_dia
  ON "n8n_appointments" ("fecha_iso_dia");

CREATE INDEX IF NOT EXISTS idx_n8n_appt_estado_cita
  ON "n8n_appointments" ("estado_cita");

CREATE INDEX IF NOT EXISTS idx_n8n_appt_especialista
  ON "n8n_appointments" ("especialista_nombre");

-- ============================================================
-- 3. DATOS DEMO (INSERT sin duplicar si ya existen)
-- ============================================================
INSERT INTO "n8n_appointments" (
  "id", "phone", "name", "servicio", "especialista_nombre",
  "fecha_texto_original", "start_iso", "end_iso", "duration_minutes",
  "fecha_iso_dia", "dia_texto", "estado_cita",
  "appointment_id", "patient_id", "doctor_id", "entity_id"
)
SELECT * FROM (VALUES
  (
    'n8n-apt-001',
    '+57 311 444 7788',
    'Valeria Rodriguez Beltran',
    'Limpieza dental',
    'Dra. Laura Castillo',
    'hoy a las 9:00 AM',
    (CURRENT_DATE + INTERVAL '9 hours')::TIMESTAMP,
    (CURRENT_DATE + INTERVAL '9 hours 30 minutes')::TIMESTAMP,
    30,
    CURRENT_DATE,
    TO_CHAR(NOW(), 'Day DD "de" Month "de" YYYY'),
    'confirmada',
    'apt-1', 'pat-1', 'doc-1', 'ent-2'
  ),
  (
    'n8n-apt-002',
    '+57 320 318 9090',
    'Mateo Gomez Henao',
    'Obturacion resina',
    'Dra. Laura Castillo',
    'hoy a las 10:00 AM',
    (CURRENT_DATE + INTERVAL '10 hours')::TIMESTAMP,
    (CURRENT_DATE + INTERVAL '10 hours 45 minutes')::TIMESTAMP,
    45,
    CURRENT_DATE,
    TO_CHAR(NOW(), 'Day DD "de" Month "de" YYYY'),
    'pendiente',
    'apt-2', 'pat-2', 'doc-1', NULL
  ),
  (
    'n8n-apt-003',
    '+57 315 222 1100',
    'Isabella Sofia Quintero Mosquera',
    'Control ortodoncia',
    'Dr. Andres Marin',
    'hoy a las 11:00 AM',
    (CURRENT_DATE + INTERVAL '11 hours')::TIMESTAMP,
    (CURRENT_DATE + INTERVAL '12 hours')::TIMESTAMP,
    60,
    CURRENT_DATE,
    TO_CHAR(NOW(), 'Day DD "de" Month "de" YYYY'),
    'pendiente',
    'apt-3', 'pat-3', 'doc-2', 'ent-3'
  ),
  (
    'n8n-apt-004',
    '+57 300 989 4567',
    'Carlos Pacheco Olivares',
    'Endodoncia molar 26',
    'Dra. Carolina Rios',
    'mañana a las 9:00 AM',
    (CURRENT_DATE + INTERVAL '1 day 9 hours')::TIMESTAMP,
    (CURRENT_DATE + INTERVAL '1 day 10 hours')::TIMESTAMP,
    60,
    CURRENT_DATE + 1,
    TO_CHAR(NOW() + INTERVAL '1 day', 'Day DD "de" Month "de" YYYY'),
    'pendiente',
    'apt-4', 'pat-4', 'doc-3', 'ent-5'
  ),
  (
    'n8n-apt-005',
    '+57 310 781 0011',
    'Juliana Forero Vargas',
    'Valoracion inicial',
    'Dra. Laura Castillo',
    'pasado mañana a las 8:00 AM',
    (CURRENT_DATE + INTERVAL '2 days 8 hours')::TIMESTAMP,
    (CURRENT_DATE + INTERVAL '2 days 8 hours 30 minutes')::TIMESTAMP,
    30,
    CURRENT_DATE + 2,
    TO_CHAR(NOW() + INTERVAL '2 days', 'Day DD "de" Month "de" YYYY'),
    'pendiente',
    'apt-5', 'pat-5', 'doc-1', 'ent-4'
  )
) AS new_rows(
  "id", "phone", "name", "servicio", "especialista_nombre",
  "fecha_texto_original", "start_iso", "end_iso", "duration_minutes",
  "fecha_iso_dia", "dia_texto", "estado_cita",
  "appointment_id", "patient_id", "doctor_id", "entity_id"
)
WHERE NOT EXISTS (
  SELECT 1 FROM "n8n_appointments" WHERE "id" = new_rows."id"
);

-- ============================================================
-- 4. VISTA: appointment_calendar_events
--    Formato plano de las citas relacionales para n8n / calendario
-- ============================================================
CREATE OR REPLACE VIEW "appointment_calendar_events" AS
SELECT
  a."id"                                                    AS "appointment_id",
  COALESCE(p."cellphone", p."phone", '')                    AS "phone",
  CONCAT(p."firstName", ' ', p."firstLastName")             AS "name",
  a."treatment"                                             AS "servicio",
  CONCAT('Dr(a). ', d."firstName", ' ', d."lastName")       AS "especialista_nombre",
  TO_CHAR(a."date", 'DD/MM/YYYY HH24:MI')                   AS "fecha_texto_original",
  a."date"                                                  AS "start_iso",
  a."date" + (a."durationMinutes" * INTERVAL '1 minute')    AS "end_iso",
  a."durationMinutes"                                       AS "duration_minutes",
  a."date"::DATE                                            AS "fecha_iso_dia",
  TO_CHAR(a."date", 'Day DD "de" Month "de" YYYY')          AS "dia_texto",
  LOWER(a."status"::TEXT)                                   AS "estado_cita",
  a."confirmationStatus"                                    AS "confirmation_status",
  a."patientId"                                             AS "patient_id",
  a."doctorId"                                              AS "doctor_id",
  a."entityId"                                              AS "entity_id"
FROM "Appointment" a
JOIN "Patient"  p ON p."id" = a."patientId"
JOIN "Doctor"   d ON d."id" = a."doctorId";

-- ============================================================
-- 5. VISTA: n8n_pending_reminders
--    Recordatorios pendientes de envío para automatizaciones n8n
-- ============================================================
CREATE OR REPLACE VIEW "n8n_pending_reminders" AS
SELECT
  r."id"                                                    AS "reminder_id",
  r."appointmentId"                                         AS "appointment_id",
  COALESCE(p."cellphone", p."phone", '')                    AS "phone",
  CONCAT(p."firstName", ' ', p."firstLastName")             AS "name",
  a."treatment"                                             AS "servicio",
  CONCAT('Dr(a). ', d."firstName", ' ', d."lastName")       AS "especialista_nombre",
  a."date"                                                  AS "start_iso",
  a."date" + (a."durationMinutes" * INTERVAL '1 minute')    AS "end_iso",
  r."stage"                                                 AS "reminder_type",
  r."scheduledAt"                                           AS "scheduled_at",
  r."status"                                                AS "status",
  'whatsapp'                                                AS "channel"
FROM "Reminder" r
JOIN "Appointment" a ON a."id" = r."appointmentId"
JOIN "Patient"     p ON p."id" = r."patientId"
JOIN "Doctor"      d ON d."id" = a."doctorId"
WHERE r."status" IN ('PROGRAMADO', 'ENVIADO');
