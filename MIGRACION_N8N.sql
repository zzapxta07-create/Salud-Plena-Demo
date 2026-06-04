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
  "date", "treatment",
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
  'Consulta general',
  'AGENDADA', 'PENDIENTE', NOW(), NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Appointment" WHERE "id" = 'apt-n8n-demo'
);

-- ============================================================
-- 8. DEMO PATIENT: Andrés Felipe Ramírez Torres (MedPlus)
--    + Historial odontológico completo para descarga de documentos
-- ============================================================

-- Paciente
INSERT INTO "Patient" (
  "id", "documentNumber", "documentType", "expeditionPlace",
  "firstName", "middleName", "firstLastName", "secondLastName",
  "gender", "birthDate", "patientType", "entityId",
  "cellphone", "email", "address", "neighborhood", "city", "state",
  "status", "createdAt", "updatedAt"
)
SELECT
  'pat-andres-medplus', '1098765432', 'CC', 'Bogota D.C.',
  'Andres', 'Felipe', 'Ramirez', 'Torres',
  'Masculino', '1985-03-15', 'ASEGURADORA', 'ent-2',
  '3001234567', 'andres.ramirez@correo.co',
  'Cra 15 # 82-34 Apto 501', 'Chapinero', 'Bogota', 'Cundinamarca',
  'EN_TRATAMIENTO', NOW() - INTERVAL '180 days', NOW() - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM "Patient" WHERE "id" = 'pat-andres-medplus');

-- Historia clínica odontológica
INSERT INTO "OdontologiaHistoriaClinica" ("id", "patientId", "payload", "createdAt")
SELECT
  'hc-andres-001', 'pat-andres-medplus',
  '{"motivoConsulta":"Revisión semestral y limpieza dental - autorización MedPlus","diagnostico":"K05.1 Periodontitis crónica leve · K02.1 Caries de dentina pieza 16","planTratamiento":"1. Detartraje supragingival · 2. Obturación pieza 16 · 3. Control en 6 meses","antecedentes":{"medicos":"Hipertensión arterial controlada (Losartán 50mg/día)","alergias":"Penicilina (reacción cutánea)","medicamentos":"Losartán 50mg una vez al día","previosTratamientos":"Exodoncias piezas 17 y 18 en 2019"},"examenClinico":{"tejidosBlandos":"Encías con leve eritema marginal en sector posterior","oclusionDental":"Clase I de Angle, leve apretamiento parafuncional","higieneBucal":"Regular, índice de placa 40%, cálculo supragingival generalizado"}}',
  NOW() - INTERVAL '365 days'
WHERE NOT EXISTS (SELECT 1 FROM "OdontologiaHistoriaClinica" WHERE "id" = 'hc-andres-001');

-- Historial de visitas (5 registros)
INSERT INTO "OdontologiaHistorico" ("id", "patientId", "date", "motive", "doctorName", "observation", "procedures")
SELECT 'ohi-andres-01', 'pat-andres-medplus', '2024-06-10', 'Examen diagnóstico inicial', 'Dra. Laura Castillo',
  'Paciente nuevo referido por MedPlus. Radiografías panorámica y periapicales tomadas.',
  'Examen clínico completo, toma de radiografías, plan de tratamiento elaborado'
WHERE NOT EXISTS (SELECT 1 FROM "OdontologiaHistorico" WHERE "id" = 'ohi-andres-01');

INSERT INTO "OdontologiaHistorico" ("id", "patientId", "date", "motive", "doctorName", "observation", "procedures")
SELECT 'ohi-andres-02', 'pat-andres-medplus', '2024-08-22', 'Detartraje supragingival y pulido coronal', 'Dra. Laura Castillo',
  'Procedimiento realizado sin complicaciones. Se indica cepillado con técnica modificada de Bass.',
  'Detartraje supragingival completo, pulido coronal con pasta profiláctica, instrucción de higiene oral'
WHERE NOT EXISTS (SELECT 1 FROM "OdontologiaHistorico" WHERE "id" = 'ohi-andres-02');

INSERT INTO "OdontologiaHistorico" ("id", "patientId", "date", "motive", "doctorName", "observation", "procedures")
SELECT 'ohi-andres-03', 'pat-andres-medplus', '2024-10-15', 'Obturación con composite pieza 16', 'Dra. Laura Castillo',
  'Caries de dentina de extensión moderada. Restauración con composite fotopolimerizable color A2.',
  'Anestesia infiltrativa, preparación cavitaria, grabado ácido, bonding, composite fotopolimerizable, pulido y ajuste oclusal'
WHERE NOT EXISTS (SELECT 1 FROM "OdontologiaHistorico" WHERE "id" = 'ohi-andres-03');

INSERT INTO "OdontologiaHistorico" ("id", "patientId", "date", "motive", "doctorName", "observation", "procedures")
SELECT 'ohi-andres-04', 'pat-andres-medplus', '2025-01-20', 'Control periódico y fluorización', 'Dra. Laura Castillo',
  'Excelente respuesta al tratamiento. Índice de placa mejorado a 15%. Encías sin sangrado.',
  'Examen de control, fluorización tópica con gel fluorado 1.23%, refuerzo de instrucción de higiene'
WHERE NOT EXISTS (SELECT 1 FROM "OdontologiaHistorico" WHERE "id" = 'ohi-andres-04');

INSERT INTO "OdontologiaHistorico" ("id", "patientId", "date", "motive", "doctorName", "observation", "procedures")
SELECT 'ohi-andres-05', 'pat-andres-medplus', '2025-05-08', 'Extracción simple pieza 28 (cordal inferior izquierdo)', 'Dr. Sebastian Pulido',
  'Pieza semierupcionada con pericoronaritis recurrente. Indicación de extracción confirmada por radiografía.',
  'Anestesia troncular inferior, sindesmotomía, exodoncia simple, curetaje del alveolo, sutura simple 3-0, indicaciones postoperatorias'
WHERE NOT EXISTS (SELECT 1 FROM "OdontologiaHistorico" WHERE "id" = 'ohi-andres-05');

-- Evoluciones clínicas (3 registros)
INSERT INTO "OdontologiaEvolucion" ("id", "patientId", "treatment", "note", "doctorName", "date", "signedByDoc", "signedByPat")
SELECT 'oev-andres-01', 'pat-andres-medplus',
  'Detartraje supragingival',
  'Paciente toleró bien el procedimiento. Leve sangrado gingival durante la limpieza, dentro de lo esperado. Se indica enjuague con clorhexidina 0.12% por 7 días.',
  'Dra. Laura Castillo', '2024-08-22', true, true
WHERE NOT EXISTS (SELECT 1 FROM "OdontologiaEvolucion" WHERE "id" = 'oev-andres-01');

INSERT INTO "OdontologiaEvolucion" ("id", "patientId", "treatment", "note", "doctorName", "date", "signedByDoc", "signedByPat")
SELECT 'oev-andres-02', 'pat-andres-medplus',
  'Obturación composite pieza 16',
  'Restauración exitosa con excelente adaptación marginal y resultado estético. Paciente refiere leve sensibilidad postoperatoria esperada. Control en 1 semana si persiste.',
  'Dra. Laura Castillo', '2024-10-15', true, true
WHERE NOT EXISTS (SELECT 1 FROM "OdontologiaEvolucion" WHERE "id" = 'oev-andres-02');

INSERT INTO "OdontologiaEvolucion" ("id", "patientId", "treatment", "note", "doctorName", "date", "signedByDoc", "signedByPat")
SELECT 'oev-andres-03', 'pat-andres-medplus',
  'Extracción pieza 28',
  'Extracción realizada sin complicaciones intraoperatorias. Sangrado controlado. Ibuprofeno 400mg c/8h por 3 días, amoxicilina 500mg c/8h por 7 días, retiro de sutura en 7 días.',
  'Dr. Sebastian Pulido', '2025-05-08', true, true
WHERE NOT EXISTS (SELECT 1 FROM "OdontologiaEvolucion" WHERE "id" = 'oev-andres-03');
