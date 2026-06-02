-- ============================================================
-- MIGRACIÓN REMINDERS PARA BD EXISTENTE
-- Tabla "Reminder" PascalCase → nueva estructura espejo de appointments
-- Ejecutar contra la BD activa en Adminer o psql
-- ============================================================
-- Flujo de recordatorios:
--   1 día antes   → n8n consulta n8n_reminders_day_before_due
--   3 horas antes → n8n consulta n8n_reminders_three_hours_due
--   Sin respuesta → n8n consulta n8n_reminders_no_response_due
-- ============================================================

-- ============================================================
-- 1. ADAPTAR TABLA "Reminder" EXISTENTE
--    (Agrega columnas nuevas sin borrar datos)
-- ============================================================

-- Renombrar tabla a minúsculas para consistencia con Prisma @@map("reminders")
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'Reminder' AND table_schema = 'public'
  ) THEN
    ALTER TABLE "Reminder" RENAME TO "reminders";
  END IF;
END $$;

-- Agregar columna appointment_id (referencia snake_case) si no existe
ALTER TABLE "reminders"
  ADD COLUMN IF NOT EXISTS "appointment_id"          TEXT,
  ADD COLUMN IF NOT EXISTS "patient_id"              TEXT,
  ADD COLUMN IF NOT EXISTS "doctor_id"               TEXT,
  ADD COLUMN IF NOT EXISTS "entity_id"               TEXT,
  -- Campos espejo de appointments
  ADD COLUMN IF NOT EXISTS "phone"                   TEXT,
  ADD COLUMN IF NOT EXISTS "name"                    TEXT,
  ADD COLUMN IF NOT EXISTS "servicio"                TEXT,
  ADD COLUMN IF NOT EXISTS "especialista_nombre"     TEXT,
  ADD COLUMN IF NOT EXISTS "fecha_texto_original"    TEXT,
  ADD COLUMN IF NOT EXISTS "start_iso"               TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "end_iso"                 TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "fecha_iso_dia"           DATE,
  ADD COLUMN IF NOT EXISTS "dia_texto"               TEXT,
  ADD COLUMN IF NOT EXISTS "estado_cita"             TEXT NOT NULL DEFAULT 'pendiente',
  -- Flujo recordatorio
  ADD COLUMN IF NOT EXISTS "estado_recordatorio"     TEXT NOT NULL DEFAULT 'PENDIENTE',
  ADD COLUMN IF NOT EXISTS "ultimo_recordatorio_tipo" TEXT,
  ADD COLUMN IF NOT EXISTS "day_before_sent_at"      TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "three_hours_sent_at"     TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "responded_at"            TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "response_text"           TEXT,
  ADD COLUMN IF NOT EXISTS "no_response_checked_at"  TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "channel"                 TEXT NOT NULL DEFAULT 'WHATSAPP',
  ADD COLUMN IF NOT EXISTS "created_at"              TIMESTAMP NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS "updated_at"              TIMESTAMP NOT NULL DEFAULT NOW();

-- Poblar appointment_id desde appointmentId (columna vieja) si existe
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reminders' AND column_name = 'appointmentId'
  ) THEN
    UPDATE "reminders"
    SET "appointment_id" = "appointmentId"
    WHERE "appointment_id" IS NULL AND "appointmentId" IS NOT NULL;
  END IF;
END $$;

-- Poblar patient_id desde patientId si existe
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reminders' AND column_name = 'patientId'
  ) THEN
    UPDATE "reminders"
    SET "patient_id" = "patientId"
    WHERE "patient_id" IS NULL AND "patientId" IS NOT NULL;
  END IF;
END $$;

-- Poblar campos espejo desde "Appointment" para reminders existentes
UPDATE "reminders" r
SET
  "phone"                = a."phone",
  "name"                 = a."name",
  "servicio"             = COALESCE(a."servicio", a."treatment"),
  "especialista_nombre"  = a."especialista_nombre",
  "fecha_texto_original" = a."fecha_texto_original",
  "start_iso"            = a."start_iso",
  "end_iso"              = a."end_iso",
  "fecha_iso_dia"        = a."fecha_iso_dia",
  "dia_texto"            = a."dia_texto",
  "estado_cita"          = COALESCE(a."estado_cita", LOWER(a."status"::TEXT)),
  "doctor_id"            = a."doctorId",
  "entity_id"            = a."entityId",
  "updated_at"           = NOW()
FROM "Appointment" a
WHERE r."appointment_id" = a."id"
  AND r."start_iso" IS NULL;

-- Mapear estado viejo → estado nuevo
UPDATE "reminders"
SET "estado_recordatorio" = CASE
  WHEN "status"::TEXT IN ('PROGRAMADO') THEN 'PENDIENTE'
  WHEN "status"::TEXT IN ('ENVIADO')    THEN 'ENVIADO'
  WHEN "status"::TEXT IN ('CONFIRMADO') THEN 'CONFIRMADO'
  WHEN "status"::TEXT IN ('NO_RESPONDE') THEN 'NO_RESPONDE'
  WHEN "status"::TEXT IN ('REAGENDAMIENTO_SOLICITADO') THEN 'REAGENDAR'
  WHEN "status"::TEXT IN ('CANCELADO')  THEN 'CANCELADO'
  ELSE 'PENDIENTE'
END
WHERE "estado_recordatorio" = 'PENDIENTE';

-- Poblar created_at desde createdAt si existe
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reminders' AND column_name = 'createdAt'
  ) THEN
    UPDATE "reminders"
    SET "created_at" = "createdAt"
    WHERE "created_at" = NOW() AND "createdAt" IS NOT NULL;
  END IF;
END $$;

-- Agregar UNIQUE constraint en appointment_id (evita duplicados por trigger)
ALTER TABLE "reminders"
  DROP CONSTRAINT IF EXISTS "reminders_appointment_id_unique";
ALTER TABLE "reminders"
  ADD CONSTRAINT "reminders_appointment_id_unique" UNIQUE ("appointment_id");

-- Agregar FK a "Appointment"
ALTER TABLE "reminders"
  DROP CONSTRAINT IF EXISTS "reminders_appointment_id_fkey";
ALTER TABLE "reminders"
  ADD CONSTRAINT "reminders_appointment_id_fkey"
    FOREIGN KEY ("appointment_id") REFERENCES "Appointment"("id") ON DELETE SET NULL;

-- ============================================================
-- 2. CREAR REMINDER ESPEJO PARA CITAS SIN REMINDER
--    (citas anteriores a la creación del trigger)
-- ============================================================
INSERT INTO "reminders" (
  "id", "appointment_id",
  "patient_id", "doctor_id", "entity_id",
  "phone", "name", "servicio",
  "especialista_nombre", "fecha_texto_original",
  "start_iso", "end_iso", "fecha_iso_dia", "dia_texto",
  "estado_cita",
  "estado_recordatorio", "channel",
  "created_at", "updated_at"
)
SELECT
  'rem-' || a."id", a."id",
  a."patientId", a."doctorId", a."entityId",
  a."phone", a."name", COALESCE(a."servicio", a."treatment"),
  a."especialista_nombre", a."fecha_texto_original",
  a."start_iso", a."end_iso", a."fecha_iso_dia", a."dia_texto",
  COALESCE(a."estado_cita", LOWER(a."status"::TEXT)),
  'PENDIENTE', 'WHATSAPP',
  NOW(), NOW()
FROM "Appointment" a
WHERE NOT EXISTS (
  SELECT 1 FROM "reminders" r WHERE r."appointment_id" = a."id"
)
AND a."start_iso" IS NOT NULL;

-- ============================================================
-- 3. HACER start_iso / end_iso / fecha_iso_dia NOT NULL
--    (solo después de poblar datos)
-- ============================================================
ALTER TABLE "reminders"
  ALTER COLUMN "start_iso"     SET NOT NULL,
  ALTER COLUMN "end_iso"       SET NOT NULL,
  ALTER COLUMN "fecha_iso_dia" SET NOT NULL;

-- ============================================================
-- 4. ÍNDICES
-- ============================================================
-- Appointments
CREATE INDEX IF NOT EXISTS "idx_appointments_start_iso"     ON "Appointment" ("start_iso");
CREATE INDEX IF NOT EXISTS "idx_appointments_end_iso"       ON "Appointment" ("end_iso");
CREATE INDEX IF NOT EXISTS "idx_appointments_fecha_iso_dia" ON "Appointment" ("fecha_iso_dia");
CREATE INDEX IF NOT EXISTS "idx_appointments_phone"         ON "Appointment" ("phone");
CREATE INDEX IF NOT EXISTS "idx_appointments_estado_cita"   ON "Appointment" ("estado_cita");
CREATE INDEX IF NOT EXISTS "idx_appointments_doctor_start"  ON "Appointment" ("doctorId", "start_iso");

-- Reminders
CREATE INDEX IF NOT EXISTS "idx_reminders_appointment_id"       ON "reminders" ("appointment_id");
CREATE INDEX IF NOT EXISTS "idx_reminders_start_iso"            ON "reminders" ("start_iso");
CREATE INDEX IF NOT EXISTS "idx_reminders_fecha_iso_dia"        ON "reminders" ("fecha_iso_dia");
CREATE INDEX IF NOT EXISTS "idx_reminders_estado_recordatorio"  ON "reminders" ("estado_recordatorio");
CREATE INDEX IF NOT EXISTS "idx_reminders_phone"                ON "reminders" ("phone");
CREATE INDEX IF NOT EXISTS "idx_reminders_day_before"           ON "reminders" ("fecha_iso_dia", "estado_recordatorio");
CREATE INDEX IF NOT EXISTS "idx_reminders_three_hours"          ON "reminders" ("start_iso", "estado_recordatorio");

-- ============================================================
-- 5. FUNCIÓN Y TRIGGERS: Appointment → reminders
-- ============================================================
CREATE OR REPLACE FUNCTION sync_appointment_to_reminder()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO "reminders" (
      "id", "appointment_id",
      "patient_id", "doctor_id", "entity_id",
      "phone", "name", "servicio",
      "especialista_nombre", "fecha_texto_original",
      "start_iso", "end_iso", "fecha_iso_dia", "dia_texto",
      "estado_cita",
      "estado_recordatorio", "channel",
      "created_at", "updated_at"
    ) VALUES (
      'rem-' || NEW."id", NEW."id",
      NEW."patientId", NEW."doctorId", NEW."entityId",
      NEW."phone", NEW."name",
      COALESCE(NEW."servicio", NEW."treatment"),
      NEW."especialista_nombre",
      COALESCE(NEW."fecha_texto_original",
               TO_CHAR(NEW."start_iso", 'DD/MM/YYYY HH24:MI')),
      NEW."start_iso", NEW."end_iso",
      NEW."fecha_iso_dia", NEW."dia_texto",
      COALESCE(NEW."estado_cita", 'pendiente'),
      'PENDIENTE', 'WHATSAPP',
      NOW(), NOW()
    )
    ON CONFLICT ("appointment_id") DO NOTHING;

  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE "reminders" SET
      "patient_id"           = NEW."patientId",
      "doctor_id"            = NEW."doctorId",
      "entity_id"            = NEW."entityId",
      "phone"                = NEW."phone",
      "name"                 = NEW."name",
      "servicio"             = COALESCE(NEW."servicio", NEW."treatment"),
      "especialista_nombre"  = NEW."especialista_nombre",
      "fecha_texto_original" = COALESCE(NEW."fecha_texto_original",
                                        TO_CHAR(NEW."start_iso", 'DD/MM/YYYY HH24:MI')),
      "start_iso"            = NEW."start_iso",
      "end_iso"              = NEW."end_iso",
      "fecha_iso_dia"        = NEW."fecha_iso_dia",
      "dia_texto"            = NEW."dia_texto",
      "estado_cita"          = COALESCE(NEW."estado_cita", 'pendiente'),
      "updated_at"           = NOW()
    WHERE "appointment_id" = NEW."id";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger INSERT: crea reminder automáticamente al agendar cita
DROP TRIGGER IF EXISTS trg_appointments_after_insert_sync_reminder ON "Appointment";
CREATE TRIGGER trg_appointments_after_insert_sync_reminder
  AFTER INSERT ON "Appointment"
  FOR EACH ROW EXECUTE FUNCTION sync_appointment_to_reminder();

-- Trigger UPDATE: sincroniza campos espejo sin tocar el flujo del recordatorio
DROP TRIGGER IF EXISTS trg_appointments_after_update_sync_reminder ON "Appointment";
CREATE TRIGGER trg_appointments_after_update_sync_reminder
  AFTER UPDATE ON "Appointment"
  FOR EACH ROW EXECUTE FUNCTION sync_appointment_to_reminder();

-- ============================================================
-- 6. VISTAS PARA n8n
-- ============================================================

-- ── Vista 1: appointment_calendar_events
DROP VIEW IF EXISTS "appointment_calendar_events";
CREATE VIEW "appointment_calendar_events" AS
SELECT
  a."id"                                                         AS appointment_id,
  COALESCE(a."phone", p."cellphone", p."phone", '')             AS phone,
  COALESCE(a."name",  p."firstName" || ' ' || p."firstLastName", '') AS name,
  COALESCE(a."servicio", a."treatment", '')                     AS servicio,
  COALESCE(a."especialista_nombre",
           'Dr(a). ' || d."firstName" || ' ' || d."lastName")  AS especialista_nombre,
  COALESCE(a."fecha_texto_original",
           TO_CHAR(a."start_iso", 'DD/MM/YYYY HH24:MI'))       AS fecha_texto_original,
  a."start_iso",
  a."end_iso",
  EXTRACT(EPOCH FROM (a."end_iso" - a."start_iso"))::INT / 60   AS duration_minutes,
  a."fecha_iso_dia",
  a."dia_texto",
  a."estado_cita",
  a."status",
  a."confirmationStatus"                                        AS confirmation_status,
  a."patientId"                                                 AS patient_id,
  a."doctorId"                                                  AS doctor_id,
  a."entityId"                                                  AS entity_id
FROM "Appointment" a
LEFT JOIN "Patient" p ON p."id" = a."patientId"
LEFT JOIN "Doctor"  d ON d."id" = a."doctorId";

-- ── Vista 2: n8n_reminders_day_before_due
-- Primer recordatorio: citas de mañana, aún PENDIENTE y sin day_before_sent_at
DROP VIEW IF EXISTS "n8n_reminders_day_before_due";
CREATE VIEW "n8n_reminders_day_before_due" AS
SELECT
  r."id"                      AS reminder_id,
  r."appointment_id",
  r."phone",
  r."name",
  r."servicio",
  r."especialista_nombre",
  r."fecha_texto_original",
  r."start_iso",
  r."end_iso",
  r."fecha_iso_dia",
  r."dia_texto",
  r."estado_cita",
  r."estado_recordatorio",
  r."ultimo_recordatorio_tipo",
  r."channel"
FROM "reminders" r
WHERE
  r."estado_recordatorio" = 'PENDIENTE'
  AND r."fecha_iso_dia" = CURRENT_DATE + INTERVAL '1 day'
  AND r."day_before_sent_at" IS NULL
  AND r."estado_cita" NOT IN ('cancelada', 'cancelado')
  AND r."phone" IS NOT NULL
  AND r."start_iso" IS NOT NULL;

-- ── Vista 3: n8n_reminders_three_hours_due
-- Segundo recordatorio: citas a ~3 horas, con estado ENVIADO o CONFIRMADO
DROP VIEW IF EXISTS "n8n_reminders_three_hours_due";
CREATE VIEW "n8n_reminders_three_hours_due" AS
SELECT
  r."id"                      AS reminder_id,
  r."appointment_id",
  r."phone",
  r."name",
  r."servicio",
  r."especialista_nombre",
  r."start_iso",
  r."end_iso",
  r."fecha_iso_dia",
  r."dia_texto",
  r."estado_cita",
  r."estado_recordatorio",
  r."ultimo_recordatorio_tipo",
  r."day_before_sent_at",
  r."three_hours_sent_at",
  r."channel"
FROM "reminders" r
WHERE
  r."start_iso" BETWEEN NOW() + INTERVAL '2 hours 55 minutes'
                    AND NOW() + INTERVAL '3 hours 5 minutes'
  AND r."three_hours_sent_at" IS NULL
  AND r."estado_recordatorio" IN ('ENVIADO', 'CONFIRMADO')
  AND r."estado_cita" NOT IN ('cancelada', 'cancelado')
  AND r."phone" IS NOT NULL;

-- ── Vista 4: n8n_reminders_no_response_due
-- Recordatorios enviados sin respuesta después de 30 minutos
DROP VIEW IF EXISTS "n8n_reminders_no_response_due";
CREATE VIEW "n8n_reminders_no_response_due" AS
SELECT
  r."id"                      AS reminder_id,
  r."appointment_id",
  r."phone",
  r."name",
  r."servicio",
  r."especialista_nombre",
  r."start_iso",
  r."end_iso",
  r."estado_recordatorio",
  r."ultimo_recordatorio_tipo",
  r."day_before_sent_at",
  r."three_hours_sent_at",
  r."responded_at",
  r."response_text",
  r."no_response_checked_at"
FROM "reminders" r
WHERE
  r."estado_recordatorio" = 'ENVIADO'
  AND r."responded_at" IS NULL
  AND r."no_response_checked_at" IS NULL
  AND COALESCE(r."three_hours_sent_at", r."day_before_sent_at") IS NOT NULL
  AND COALESCE(r."three_hours_sent_at", r."day_before_sent_at")
      <= NOW() - INTERVAL '30 minutes';

-- ============================================================
-- 7. INSERTAR Angel Zapata (si no existe)
-- ============================================================
-- DEMO: reemplazar por datos ficticios en producción
INSERT INTO "Patient" (
  "id", "documentNumber", "documentType", "expeditionPlace",
  "firstName", "middleName", "firstLastName", "secondLastName",
  "gender", "birthDate", "patientType", "entityId",
  "phone", "cellphone",
  "status", "createdAt", "updatedAt"
)
SELECT
  'pat-6', '1109548694', 'CC', 'Bogota D.C.',
  'Angel', '', 'Zapata', '',
  'Masculino', '2007-11-28', 'PARTICULAR', NULL,
  '3053427529', '3053427529',
  'NUEVO', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Patient" WHERE "documentNumber" = '1109548694'
);

-- ============================================================
-- 8. INSERTAR CITA DE ANGEL ZAPATA (si no existe)
--    El trigger crea el reminder automáticamente
-- ============================================================
INSERT INTO "Appointment" (
  "id", "patientId", "doctorId", "entityId",
  "phone", "name", "servicio",
  "especialista_nombre", "fecha_texto_original",
  "start_iso", "end_iso", "fecha_iso_dia", "dia_texto", "estado_cita",
  "date", "durationMinutes", "treatment",
  "status", "confirmationStatus", "createdAt", "updatedAt"
)
SELECT
  'apt-angel', 'pat-6', 'doc-1', NULL,
  '3053427529', 'Angel Zapata', 'Valoración inicial',
  'Dr(a). Laura Castillo', '02/06/2026 15:00',
  '2026-06-02 15:00:00'::TIMESTAMP,
  '2026-06-02 16:00:00'::TIMESTAMP,
  '2026-06-02'::DATE,
  'martes', 'pendiente',
  '2026-06-02 15:00:00'::TIMESTAMP, 60, 'Valoración inicial',
  'AGENDADA', 'PENDIENTE', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Appointment" WHERE "id" = 'apt-angel'
);

-- Verificar que el reminder fue creado por trigger (o crearlo si no existe)
INSERT INTO "reminders" (
  "id", "appointment_id",
  "patient_id", "doctor_id",
  "phone", "name", "servicio",
  "especialista_nombre", "fecha_texto_original",
  "start_iso", "end_iso", "fecha_iso_dia", "dia_texto",
  "estado_cita", "estado_recordatorio", "channel",
  "created_at", "updated_at"
)
SELECT
  'rem-apt-angel', 'apt-angel',
  'pat-6', 'doc-1',
  '3053427529', 'Angel Zapata', 'Valoración inicial',
  'Dr(a). Laura Castillo', '02/06/2026 15:00',
  '2026-06-02 15:00:00'::TIMESTAMP,
  '2026-06-02 16:00:00'::TIMESTAMP,
  '2026-06-02'::DATE,
  'martes',
  'pendiente', 'PENDIENTE', 'WHATSAPP',
  NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "reminders" WHERE "appointment_id" = 'apt-angel'
);

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
SELECT
  '✅ MIGRACIÓN REMINDERS COMPLETADA' AS estado,
  (SELECT COUNT(*) FROM "reminders") AS total_reminders,
  (SELECT COUNT(*) FROM "reminders" WHERE "appointment_id" = 'apt-angel') AS angel_zapata_reminder,
  (SELECT COUNT(*) FROM "n8n_reminders_day_before_due") AS day_before_due,
  (SELECT COUNT(*) FROM "n8n_reminders_three_hours_due") AS three_hours_due,
  (SELECT COUNT(*) FROM "n8n_reminders_no_response_due") AS no_response_due;

-- ============================================================
-- CONSULTAS ÚTILES PARA n8n
-- ============================================================

/*
-- ① PRIMER RECORDATORIO (1 día antes) — consulta n8n
SELECT * FROM n8n_reminders_day_before_due;

-- ① Marcar como ENVIADO después de enviar WhatsApp
UPDATE reminders SET
  estado_recordatorio      = 'ENVIADO',
  ultimo_recordatorio_tipo = 'DIA_ANTES',
  day_before_sent_at       = NOW(),
  updated_at               = NOW()
WHERE id = $1;

-- ② SEGUNDO RECORDATORIO (3 horas antes) — consulta n8n
SELECT * FROM n8n_reminders_three_hours_due;

-- ② Marcar como enviado el recordatorio de 3 horas antes
UPDATE reminders SET
  ultimo_recordatorio_tipo = 'TRES_HORAS',
  three_hours_sent_at      = NOW(),
  updated_at               = NOW()
WHERE id = $1;

-- ③ Paciente CONFIRMA
UPDATE reminders SET
  estado_recordatorio = 'CONFIRMADO',
  responded_at        = NOW(),
  response_text       = $2,
  updated_at          = NOW()
WHERE id = $1;
-- Sincronizar appointments
UPDATE "Appointment" SET
  estado_cita          = 'confirmada',
  "confirmationStatus" = 'CONFIRMADA',
  "updatedAt"          = NOW()
WHERE id = (SELECT appointment_id FROM reminders WHERE id = $1);

-- ④ NO RESPONDE (después de 30 min)
SELECT * FROM n8n_reminders_no_response_due;
UPDATE reminders SET
  estado_recordatorio   = 'NO_RESPONDE',
  no_response_checked_at = NOW(),
  updated_at             = NOW()
WHERE id = $1;

-- ⑤ CANCELAR
UPDATE reminders SET
  estado_recordatorio = 'CANCELADO',
  estado_cita         = 'cancelada',
  responded_at        = NOW(),
  response_text       = $2,
  updated_at          = NOW()
WHERE id = $1;
UPDATE "Appointment" SET
  estado_cita = 'cancelada',
  status      = 'CANCELADA',
  "updatedAt" = NOW()
WHERE id = (SELECT appointment_id FROM reminders WHERE id = $1);

-- ⑥ REAGENDAR
UPDATE reminders SET
  estado_recordatorio = 'REAGENDAR',
  estado_cita         = 'reagendar',
  responded_at        = NOW(),
  response_text       = $2,
  updated_at          = NOW()
WHERE id = $1;
UPDATE "Appointment" SET
  estado_cita = 'reagendar',
  status      = 'REAGENDAR',
  "updatedAt" = NOW()
WHERE id = (SELECT appointment_id FROM reminders WHERE id = $1);
*/
