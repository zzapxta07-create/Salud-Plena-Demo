-- ============================================================
-- SALUD PLENA DEMO - SEED SQL COMPLETO PARA POSTGRESQL
-- ============================================================
-- Compatibilidad: PostgreSQL 12+
-- Ejecutable en: Adminer, psql, pgAdmin
-- Versión: 2026-05-18
-- Instrucciones:
--   1. Abre http://localhost:8080 (Adminer)
--   2. Login con: postgres / postgres
--   3. Selecciona base de datos: salud_plena_demo
--   4. Ve a "SQL command"
--   5. Copia TODO este contenido
--   6. Pega en el editor SQL
--   7. Click "Execute"
--   8. Espera 5 segundos
--   9. Verifica mensajes de validación al final
-- ============================================================

-- ============================================================
-- 1. LIMPIEZA SEGURA (Drop en orden inverso)
-- ============================================================
DROP TABLE IF EXISTS whatsapp_messages CASCADE;
DROP TABLE IF EXISTS whatsapp_conversations CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS attached_files CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS consents CASCADE;
DROP TABLE IF EXISTS document_packs CASCADE;
DROP TABLE IF EXISTS crm_cases CASCADE;

DROP TABLE IF EXISTS odontologia_odontogramas CASCADE;
DROP TABLE IF EXISTS odontologia_historicos CASCADE;
DROP TABLE IF EXISTS odontologia_evoluciones CASCADE;
DROP TABLE IF EXISTS odontologia_historia_clinica CASCADE;
DROP TABLE IF EXISTS odontologia_valoraciones CASCADE;

DROP TABLE IF EXISTS ortodoncia_odontogramas CASCADE;
DROP TABLE IF EXISTS ortodoncia_historicos CASCADE;
DROP TABLE IF EXISTS ortodoncia_evoluciones CASCADE;
DROP TABLE IF EXISTS ortodoncia_historia_clinica CASCADE;
DROP TABLE IF EXISTS ortodoncia_valoraciones CASCADE;

DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS entities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Eliminar ENUMs si existen
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "PatientType" CASCADE;
DROP TYPE IF EXISTS "PatientStatus" CASCADE;
DROP TYPE IF EXISTS "AppointmentStatus" CASCADE;
DROP TYPE IF EXISTS "ConfirmationStatus" CASCADE;
-- ReminderStage y ReminderStatus eliminados — reminders ahora usa TEXT
DROP TYPE IF EXISTS "WaConversationStatus" CASCADE;
DROP TYPE IF EXISTS "WaIntent" CASCADE;
DROP TYPE IF EXISTS "CrmCaseType" CASCADE;
DROP TYPE IF EXISTS "CrmStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "ConsentType" CASCADE;

-- ============================================================
-- 2. CREAR ENUMS
-- ============================================================
CREATE TYPE "UserRole" AS ENUM ('ADMINISTRADOR');

CREATE TYPE "PatientType" AS ENUM ('PARTICULAR', 'ASEGURADORA', 'ARL', 'CONVENIO');

CREATE TYPE "PatientStatus" AS ENUM (
  'NUEVO',
  'ACTIVO',
  'EN_AUTORIZACION',
  'PENDIENTE_DOCUMENTOS',
  'AGENDADO',
  'EN_TRATAMIENTO',
  'FINALIZADO',
  'INACTIVO'
);

CREATE TYPE "AppointmentStatus" AS ENUM (
  'AGENDADA',
  'CANCELADA',
  'FINALIZADA',
  'PENDIENTE',
  'CONFIRMADA',
  'SIN_RESPUESTA',
  'REAGENDAR',
  'NO_ASISTIO'
);

CREATE TYPE "ConfirmationStatus" AS ENUM (
  'PENDIENTE',
  'CONFIRMADA',
  'REAGENDAMIENTO_SOLICITADO',
  'CANCELADA',
  'NO_RESPONDE'
);

-- ReminderStage y ReminderStatus removidos — reminders usa TEXT para compatibilidad n8n

CREATE TYPE "WaConversationStatus" AS ENUM (
  'NUEVA',
  'ATENCION_IA',
  'REQUIERE_HUMANO',
  'GESTION_HUMANA',
  'FINALIZADA',
  'PENDIENTE_DOCUMENTO',
  'PENDIENTE_DATOS',
  'PENDIENTE_VALIDACION'
);

CREATE TYPE "WaIntent" AS ENUM (
  'AGENDAR_CITA',
  'CANCELAR_CITA',
  'REAGENDAR_CITA',
  'SOLICITAR_AUTORIZACION',
  'ENVIAR_DOCUMENTOS',
  'SOLICITAR_COTIZACION',
  'HABLAR_CON_ASESOR',
  'CONFIRMAR_CITA'
);

CREATE TYPE "CrmCaseType" AS ENUM (
  'SOLICITUD_AUTORIZACION',
  'PARTICULAR_INTERESADO',
  'COTIZACION_PENDIENTE',
  'REAGENDAMIENTO',
  'CANCELACION',
  'DOCUMENTO_PENDIENTE',
  'RADICADO_PENDIENTE',
  'LISTO_PARA_AGENDAR'
);

CREATE TYPE "CrmStatus" AS ENUM (
  'NUEVO',
  'DATOS_INCOMPLETOS',
  'DOCUMENTOS_PENDIENTES',
  'PENDIENTE_REVISION_HUMANA',
  'EN_PREPARACION_DOCUMENTAL',
  'RADICADO_SOLICITADO',
  'RADICADO_RECIBIDO',
  'LISTO_PARA_AGENDAR',
  'AGENDADO',
  'CONFIRMADO',
  'FINALIZADO',
  'PERDIDO'
);

CREATE TYPE "PaymentStatus" AS ENUM ('PENDIENTE', 'PAGADO', 'ABONO', 'ANULADO');

CREATE TYPE "ConsentType" AS ENUM (
  'ANESTESIA_LOCAL',
  'ODONTOLOGIA_RESTAURADORA',
  'ENDODONCIA',
  'EXODONCIA_SIMPLE',
  'PERIODONCIA',
  'PROMOCION_PREVENCION',
  'PROCEDIMIENTOS_IMPLANTOLOGICOS',
  'COVID_19'
);

-- ============================================================
-- 3. CREAR TABLAS
-- ============================================================

-- Usuarios
CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "role" "UserRole" DEFAULT 'ADMINISTRADOR',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Entidades
CREATE TABLE "entities" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "type" TEXT NOT NULL,
  "active" BOOLEAN DEFAULT true
);

-- Doctores
CREATE TABLE "doctors" (
  "id" TEXT PRIMARY KEY,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "specialty" TEXT NOT NULL,
  "email" TEXT UNIQUE,
  "phone" TEXT,
  "active" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Pacientes
CREATE TABLE "patients" (
  "id" TEXT PRIMARY KEY,
  "documentNumber" TEXT UNIQUE NOT NULL,
  "documentType" TEXT NOT NULL,
  "expeditionPlace" TEXT,
  "firstName" TEXT NOT NULL,
  "middleName" TEXT,
  "firstLastName" TEXT NOT NULL,
  "secondLastName" TEXT,
  "gender" TEXT NOT NULL,
  "birthDate" DATE NOT NULL,
  "patientType" "PatientType" NOT NULL,
  "entityId" TEXT REFERENCES "entities"("id"),
  "phone" TEXT,
  "cellphone" TEXT,
  "email" TEXT,
  "address" TEXT,
  "neighborhood" TEXT,
  "city" TEXT,
  "state" TEXT,
  "photoUrl" TEXT,
  "status" "PatientStatus" DEFAULT 'NUEVO',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT
);

-- Citas
CREATE TABLE "appointments" (
  "id"                   TEXT        PRIMARY KEY,
  -- Relaciones (opcionales: n8n puede insertar sin paciente/doctor previos)
  "patientId"            TEXT        REFERENCES "patients"("id") ON DELETE SET NULL,
  "doctorId"             TEXT        REFERENCES "doctors"("id") ON DELETE SET NULL,
  "entityId"             TEXT        REFERENCES "entities"("id"),
  "crmCaseId"            TEXT,
  -- Campos planos n8n / chatbot — fuente principal del calendario
  "start_iso"            TIMESTAMP   NOT NULL,
  "end_iso"              TIMESTAMP   NOT NULL,
  "fecha_iso_dia"        DATE        NOT NULL,
  "dia_texto"            TEXT,
  "servicio"             TEXT,
  "name"                 TEXT,
  "phone"                TEXT,
  "especialista_nombre"  TEXT,
  "fecha_texto_original" TEXT,
  "estado_cita"          TEXT        NOT NULL DEFAULT 'pendiente',
  -- Campos legacy (compatibilidad)
  "date"                 TIMESTAMP,
  "duration_minutes"     INTEGER     DEFAULT 30,
  "treatment"            TEXT,
  "observation"          TEXT,
  "requestedDate"        TIMESTAMP,
  "desiredDate"          TIMESTAMP,
  -- Campos de sistema
  "status"               "AppointmentStatus"  DEFAULT 'AGENDADA',
  "confirmationStatus"   "ConfirmationStatus" DEFAULT 'PENDIENTE',
  "createdAt"            TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Recordatorios — espejo operativo de appointments para WhatsApp/n8n
-- Creado automáticamente por trigger AFTER INSERT ON appointments
CREATE TABLE "reminders" (
  "id"                      TEXT PRIMARY KEY,
  -- Referencia a cita (SET NULL en caso de borrado)
  "appointment_id"          TEXT REFERENCES "appointments"("id") ON DELETE SET NULL,
  "patient_id"              TEXT,
  "doctor_id"               TEXT,
  "entity_id"               TEXT,

  -- Campos espejo copiados desde appointments por trigger
  "phone"                   TEXT,
  "name"                    TEXT,
  "servicio"                TEXT,
  "especialista_nombre"     TEXT,
  "fecha_texto_original"    TEXT,
  "start_iso"               TIMESTAMP NOT NULL,
  "end_iso"                 TIMESTAMP NOT NULL,
  "fecha_iso_dia"           DATE      NOT NULL,
  "dia_texto"               TEXT,
  "estado_cita"             TEXT      NOT NULL DEFAULT 'pendiente',

  -- Flujo de recordatorio (gestionado por n8n)
  "estado_recordatorio"     TEXT      NOT NULL DEFAULT 'PENDIENTE',
  "ultimo_recordatorio_tipo" TEXT,
  "day_before_sent_at"      TIMESTAMP,
  "three_hours_sent_at"     TIMESTAMP,
  "responded_at"            TIMESTAMP,
  "response_text"           TEXT,
  "no_response_checked_at"  TIMESTAMP,
  "channel"                 TEXT      NOT NULL DEFAULT 'WHATSAPP',

  "created_at"              TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at"              TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Un reminder por cita
  CONSTRAINT "reminders_appointment_id_unique" UNIQUE ("appointment_id")
);

-- Conversaciones WhatsApp
CREATE TABLE "whatsapp_conversations" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT REFERENCES "patients"("id"),
  "phone" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "lastMessage" TEXT,
  "status" "WaConversationStatus" DEFAULT 'NUEVA',
  "intent" "WaIntent",
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Mensajes WhatsApp
CREATE TABLE "whatsapp_messages" (
  "id" TEXT PRIMARY KEY,
  "conversationId" TEXT NOT NULL REFERENCES "whatsapp_conversations"("id") ON DELETE CASCADE,
  "direction" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "attachmentLabel" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Casos CRM
CREATE TABLE "crm_cases" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "entityId" TEXT REFERENCES "entities"("id"),
  "type" "CrmCaseType" NOT NULL,
  "status" "CrmStatus" DEFAULT 'NUEVO',
  "nextAction" TEXT,
  "responsible" TEXT,
  "lastInteraction" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "observations" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Pagos
CREATE TABLE "payments" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "concept" TEXT NOT NULL,
  "amount" DECIMAL(12, 2) NOT NULL,
  "method" TEXT NOT NULL,
  "paidAt" TIMESTAMP,
  "status" "PaymentStatus" DEFAULT 'PENDIENTE',
  "observation" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Archivos Adjuntos
CREATE TABLE "attached_files" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "fileType" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT,
  "uploadedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "crmCaseId" TEXT REFERENCES "crm_cases"("id")
);

-- Paquetes Documentales
CREATE TABLE "document_packs" (
  "id" TEXT PRIMARY KEY,
  "entityId" TEXT NOT NULL REFERENCES "entities"("id"),
  "label" TEXT NOT NULL,
  "format" TEXT NOT NULL
);

-- Consentimientos
CREATE TABLE "consents" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "doctorId" TEXT REFERENCES "doctors"("id"),
  "type" "ConsentType" NOT NULL,
  "consultation" TEXT,
  "entityName" TEXT,
  "signedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Odontología - Valoraciones
CREATE TABLE "odontologia_valoraciones" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "generalNotes" TEXT,
  "teethStates" JSONB,
  "doctorName" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Odontología - Historia Clínica
CREATE TABLE "odontologia_historia_clinica" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "payload" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Odontología - Evoluciones
CREATE TABLE "odontologia_evoluciones" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "treatment" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "doctorName" TEXT NOT NULL,
  "date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "signedByDoc" BOOLEAN DEFAULT false,
  "signedByPat" BOOLEAN DEFAULT false
);

-- Odontología - Históricos
CREATE TABLE "odontologia_historicos" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "date" TIMESTAMP NOT NULL,
  "motive" TEXT NOT NULL,
  "doctorName" TEXT NOT NULL,
  "observation" TEXT,
  "procedures" TEXT
);

-- Odontología - Odontogramas
CREATE TABLE "odontologia_odontogramas" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "teethStates" JSONB,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ortodoncia - Valoraciones
CREATE TABLE "ortodoncia_valoraciones" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "generalNotes" TEXT,
  "teethStates" JSONB,
  "doctorName" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ortodoncia - Historia Clínica
CREATE TABLE "ortodoncia_historia_clinica" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "payload" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ortodoncia - Evoluciones
CREATE TABLE "ortodoncia_evoluciones" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "treatment" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "doctorName" TEXT NOT NULL,
  "date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "signedByDoc" BOOLEAN DEFAULT false,
  "signedByPat" BOOLEAN DEFAULT false
);

-- Ortodoncia - Históricos
CREATE TABLE "ortodoncia_historicos" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "date" TIMESTAMP NOT NULL,
  "motive" TEXT NOT NULL,
  "doctorName" TEXT NOT NULL,
  "observation" TEXT,
  "procedures" TEXT
);

-- Ortodoncia - Odontogramas
CREATE TABLE "ortodoncia_odontogramas" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "teethStates" JSONB,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. CREAR ÍNDICES
-- ============================================================
CREATE INDEX idx_patients_document ON "patients"("documentNumber");
CREATE INDEX idx_patients_status ON "patients"("status");
CREATE INDEX idx_patients_entity ON "patients"("entityId");
CREATE INDEX idx_appointments_patient ON "appointments"("patientId");
CREATE INDEX idx_appointments_doctor ON "appointments"("doctorId");
CREATE INDEX idx_appointments_date ON "appointments"("date");
CREATE INDEX idx_appointments_doctor_date ON "appointments"("doctorId", "date");
CREATE INDEX idx_appointments_status_date ON "appointments"("status", "date");
-- Índices appointments (n8n)
CREATE INDEX IF NOT EXISTS "idx_appointments_start_iso"     ON "appointments" ("start_iso");
CREATE INDEX IF NOT EXISTS "idx_appointments_end_iso"       ON "appointments" ("end_iso");
CREATE INDEX IF NOT EXISTS "idx_appointments_fecha_iso_dia" ON "appointments" ("fecha_iso_dia");
CREATE INDEX IF NOT EXISTS "idx_appointments_phone"         ON "appointments" ("phone");
CREATE INDEX IF NOT EXISTS "idx_appointments_estado_cita"   ON "appointments" ("estado_cita");
CREATE INDEX IF NOT EXISTS "idx_appointments_doctor_start"  ON "appointments" ("doctorId", "start_iso");

-- Índices reminders (n8n)
CREATE INDEX IF NOT EXISTS "idx_reminders_appointment_id"       ON "reminders" ("appointment_id");
CREATE INDEX IF NOT EXISTS "idx_reminders_start_iso"            ON "reminders" ("start_iso");
CREATE INDEX IF NOT EXISTS "idx_reminders_fecha_iso_dia"        ON "reminders" ("fecha_iso_dia");
CREATE INDEX IF NOT EXISTS "idx_reminders_estado_recordatorio"  ON "reminders" ("estado_recordatorio");
CREATE INDEX IF NOT EXISTS "idx_reminders_phone"                ON "reminders" ("phone");
CREATE INDEX IF NOT EXISTS "idx_reminders_day_before"           ON "reminders" ("fecha_iso_dia", "estado_recordatorio");
CREATE INDEX IF NOT EXISTS "idx_reminders_three_hours"          ON "reminders" ("start_iso", "estado_recordatorio");
CREATE INDEX idx_whatsapp_patient ON "whatsapp_conversations"("patientId");
CREATE INDEX idx_crm_patient ON "crm_cases"("patientId");
CREATE INDEX idx_crm_status ON "crm_cases"("status");
CREATE INDEX idx_payments_patient ON "payments"("patientId");
CREATE INDEX idx_attachments_patient ON "attached_files"("patientId");
CREATE INDEX idx_consents_patient ON "consents"("patientId");

-- ============================================================
-- 5. FUNCIÓN Y TRIGGERS: appointments → reminders (espejo automático)
-- ============================================================

CREATE OR REPLACE FUNCTION sync_appointment_to_reminder()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Crear reminder espejo al insertar una cita
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
      NEW."phone", NEW."name", NEW."servicio",
      NEW."especialista_nombre", NEW."fecha_texto_original",
      NEW."start_iso", NEW."end_iso", NEW."fecha_iso_dia", NEW."dia_texto",
      NEW."estado_cita",
      'PENDIENTE', 'WHATSAPP',
      NOW(), NOW()
    )
    ON CONFLICT ("appointment_id") DO NOTHING;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Sincronizar campos espejo sin sobrescribir el flujo del recordatorio
    UPDATE "reminders" SET
      "patient_id"           = NEW."patientId",
      "doctor_id"            = NEW."doctorId",
      "entity_id"            = NEW."entityId",
      "phone"                = NEW."phone",
      "name"                 = NEW."name",
      "servicio"             = NEW."servicio",
      "especialista_nombre"  = NEW."especialista_nombre",
      "fecha_texto_original" = NEW."fecha_texto_original",
      "start_iso"            = NEW."start_iso",
      "end_iso"              = NEW."end_iso",
      "fecha_iso_dia"        = NEW."fecha_iso_dia",
      "dia_texto"            = NEW."dia_texto",
      "estado_cita"          = NEW."estado_cita",
      "updated_at"           = NOW()
    WHERE "appointment_id" = NEW."id";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger INSERT: crea reminder automáticamente al agendar cita
CREATE TRIGGER trg_appointments_after_insert_sync_reminder
  AFTER INSERT ON "appointments"
  FOR EACH ROW EXECUTE FUNCTION sync_appointment_to_reminder();

-- Trigger UPDATE: sincroniza datos espejo sin tocar el estado del recordatorio
CREATE TRIGGER trg_appointments_after_update_sync_reminder
  AFTER UPDATE ON "appointments"
  FOR EACH ROW EXECUTE FUNCTION sync_appointment_to_reminder();

-- ============================================================
-- 6. INSERTAR DATOS
-- ============================================================

-- USUARIOS (1)
INSERT INTO "users" ("id", "email", "name", "role", "createdAt", "updatedAt")
VALUES ('user-admin', 'admin@saludplena.demo', 'Administrador', 'ADMINISTRADOR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ENTIDADES (5)
INSERT INTO "entities" ("id", "name", "type", "active") VALUES
('ent-1', 'Particular', 'Particular', true),
('ent-2', 'MedPlus', 'Aseguradora', true),
('ent-3', 'Sura', 'Aseguradora', true),
('ent-4', 'Salud Total', 'Aseguradora', true),
('ent-5', 'ARL Bolivar', 'ARL', true);

-- DOCTORES (4)
INSERT INTO "doctors" ("id", "firstName", "lastName", "specialty", "email", "phone", "active", "createdAt", "updatedAt") VALUES
('doc-1', 'Laura', 'Castillo', 'Odontologia general', 'laura.c@saludplena.demo', '300 555 1001', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('doc-2', 'Andres', 'Marin', 'Ortodoncia', 'andres.m@saludplena.demo', '300 555 1002', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('doc-3', 'Carolina', 'Rios', 'Endodoncia', 'caro.r@saludplena.demo', '300 555 1003', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('doc-4', 'Sebastian', 'Pulido', 'Periodoncia / Implantes', 'seb.p@saludplena.demo', '300 555 1004', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- PACIENTES (5)
INSERT INTO "patients" (
  "id", "documentNumber", "documentType", "expeditionPlace", "firstName", "middleName",
  "firstLastName", "secondLastName", "gender", "birthDate", "patientType", "entityId",
  "phone", "cellphone", "email", "address", "neighborhood", "city", "state", "status",
  "createdAt", "updatedAt"
) VALUES
('pat-1', '1010101010', 'CC', 'Bogota D.C.', 'Valeria', '', 'Rodriguez', 'Beltran', 'Femenino', '1992-04-12', 'ASEGURADORA', 'ent-2', '601 555 4400', '311 444 7788', 'valeria.r@correo.demo', 'Cra 11 #84-30 Apto 502', 'El Nogal', 'Bogota', 'Cundinamarca', 'EN_TRATAMIENTO', NOW() - INTERVAL '120 days', NOW() - INTERVAL '3 days'),
('pat-2', '1020203030', 'CC', 'Medellin', 'Mateo', '', 'Gomez', 'Henao', 'Masculino', '1988-09-22', 'PARTICULAR', 'ent-1', NULL, '320 318 9090', 'mateo.g@correo.demo', 'Cl 10 #43A-22', 'Poblado', 'Medellin', 'Antioquia', 'AGENDADO', NOW() - INTERVAL '80 days', NOW() - INTERVAL '1 day'),
('pat-3', '1030304040', 'CC', 'Cali', 'Isabella', 'Sofia', 'Quintero', 'Mosquera', 'Femenino', '2002-01-30', 'ASEGURADORA', 'ent-3', NULL, '315 222 1100', 'isabella.q@correo.demo', 'Av 6N #25-10', 'Granada', 'Cali', 'Valle del Cauca', 'EN_AUTORIZACION', NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 days'),
('pat-4', '1040405050', 'CC', 'Barranquilla', 'Carlos', '', 'Pacheco', 'Olivares', 'Masculino', '1975-06-04', 'ARL', 'ent-5', NULL, '300 989 4567', 'carlos.p@correo.demo', 'Cl 84 #50-21', 'Riomar', 'Barranquilla', 'Atlantico', 'PENDIENTE_DOCUMENTOS', NOW() - INTERVAL '12 days', NOW() - INTERVAL '1 day'),
('pat-5', '1050506060', 'TI', 'Bogota D.C.', 'Juliana', '', 'Forero', 'Vargas', 'Femenino', '2011-11-15', 'ASEGURADORA', 'ent-4', NULL, '310 781 0011', 'j.forero.acudiente@correo.demo', 'Cl 145 #19-40', 'Cedritos', 'Bogota', 'Cundinamarca', 'NUEVO', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
-- DEMO: reemplazar por datos ficticios en producción
('pat-6', '1109548694', 'CC', 'Bogota D.C.', 'Angel', '', 'Zapata', '', 'Masculino', '2007-11-28', 'PARTICULAR', 'ent-1', '3053427529', '3053427529', NULL, NULL, NULL, 'Bogota', 'Cundinamarca', 'NUEVO', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- CITAS (10)
-- Helper para dia_texto en español
-- EXTRACT(DOW): 0=domingo,1=lunes,...,6=sábado
-- Se usa una expresión CASE inline en cada fila

INSERT INTO "appointments" (
  "id", "patientId", "doctorId", "entityId",
  "start_iso", "end_iso", "fecha_iso_dia", "dia_texto",
  "servicio", "name", "phone", "especialista_nombre", "fecha_texto_original", "estado_cita",
  "date", "duration_minutes", "treatment", "observation",
  "status", "confirmationStatus", "createdAt", "updatedAt"
) VALUES
(
  'apt-1', 'pat-1', 'doc-1', 'ent-2',
  DATE_TRUNC('day', NOW()) + INTERVAL '9 hours',
  DATE_TRUNC('day', NOW()) + INTERVAL '9 hours 30 minutes',
  DATE_TRUNC('day', NOW())::DATE,
  (CASE EXTRACT(DOW FROM NOW()) WHEN 0 THEN 'domingo' WHEN 1 THEN 'lunes' WHEN 2 THEN 'martes' WHEN 3 THEN 'miércoles' WHEN 4 THEN 'jueves' WHEN 5 THEN 'viernes' ELSE 'sábado' END),
  'Limpieza dental', 'Valeria Rodriguez', '+57 311 444 7788', 'Dr(a). Laura Castillo',
  TO_CHAR(DATE_TRUNC('day',NOW()) + INTERVAL '9 hours','DD/MM/YYYY HH24:MI'), 'agendada',
  DATE_TRUNC('day', NOW()) + INTERVAL '9 hours', 30, 'Limpieza dental', 'Paciente en tratamiento periodontal',
  'AGENDADA', 'CONFIRMADA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'apt-2', 'pat-2', 'doc-1', NULL,
  DATE_TRUNC('day', NOW()) + INTERVAL '10 hours',
  DATE_TRUNC('day', NOW()) + INTERVAL '10 hours 45 minutes',
  DATE_TRUNC('day', NOW())::DATE,
  (CASE EXTRACT(DOW FROM NOW()) WHEN 0 THEN 'domingo' WHEN 1 THEN 'lunes' WHEN 2 THEN 'martes' WHEN 3 THEN 'miércoles' WHEN 4 THEN 'jueves' WHEN 5 THEN 'viernes' ELSE 'sábado' END),
  'Obturacion resina', 'Mateo Gomez', '+57 320 318 9090', 'Dr(a). Laura Castillo',
  TO_CHAR(DATE_TRUNC('day',NOW()) + INTERVAL '10 hours','DD/MM/YYYY HH24:MI'), 'agendada',
  DATE_TRUNC('day', NOW()) + INTERVAL '10 hours', 45, 'Obturacion resina', NULL,
  'AGENDADA', 'PENDIENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'apt-3', 'pat-3', 'doc-2', 'ent-3',
  DATE_TRUNC('day', NOW()) + INTERVAL '11 hours',
  DATE_TRUNC('day', NOW()) + INTERVAL '12 hours',
  DATE_TRUNC('day', NOW())::DATE,
  (CASE EXTRACT(DOW FROM NOW()) WHEN 0 THEN 'domingo' WHEN 1 THEN 'lunes' WHEN 2 THEN 'martes' WHEN 3 THEN 'miércoles' WHEN 4 THEN 'jueves' WHEN 5 THEN 'viernes' ELSE 'sábado' END),
  'Control ortodoncia', 'Isabella Quintero', '+57 315 222 1100', 'Dr(a). Andres Marin',
  TO_CHAR(DATE_TRUNC('day',NOW()) + INTERVAL '11 hours','DD/MM/YYYY HH24:MI'), 'pendiente',
  DATE_TRUNC('day', NOW()) + INTERVAL '11 hours', 60, 'Control ortodoncia', NULL,
  'PENDIENTE', 'PENDIENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'apt-4', 'pat-4', 'doc-3', 'ent-5',
  DATE_TRUNC('day', NOW()) + INTERVAL '1 day 9 hours',
  DATE_TRUNC('day', NOW()) + INTERVAL '1 day 10 hours',
  (DATE_TRUNC('day', NOW()) + INTERVAL '1 day')::DATE,
  (CASE EXTRACT(DOW FROM NOW() + INTERVAL '1 day') WHEN 0 THEN 'domingo' WHEN 1 THEN 'lunes' WHEN 2 THEN 'martes' WHEN 3 THEN 'miércoles' WHEN 4 THEN 'jueves' WHEN 5 THEN 'viernes' ELSE 'sábado' END),
  'Endodoncia molar 26', 'Carlos Pacheco', '+57 300 989 4567', 'Dr(a). Carolina Rios',
  TO_CHAR(DATE_TRUNC('day',NOW()) + INTERVAL '1 day 9 hours','DD/MM/YYYY HH24:MI'), 'agendada',
  DATE_TRUNC('day', NOW()) + INTERVAL '1 day 9 hours', 60, 'Endodoncia molar 26', NULL,
  'AGENDADA', 'PENDIENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'apt-5', 'pat-5', 'doc-1', 'ent-4',
  DATE_TRUNC('day', NOW()) + INTERVAL '2 days 8 hours',
  DATE_TRUNC('day', NOW()) + INTERVAL '2 days 8 hours 30 minutes',
  (DATE_TRUNC('day', NOW()) + INTERVAL '2 days')::DATE,
  (CASE EXTRACT(DOW FROM NOW() + INTERVAL '2 days') WHEN 0 THEN 'domingo' WHEN 1 THEN 'lunes' WHEN 2 THEN 'martes' WHEN 3 THEN 'miércoles' WHEN 4 THEN 'jueves' WHEN 5 THEN 'viernes' ELSE 'sábado' END),
  'Valoracion inicial', 'Juliana Forero', '+57 310 781 0011', 'Dr(a). Laura Castillo',
  TO_CHAR(DATE_TRUNC('day',NOW()) + INTERVAL '2 days 8 hours','DD/MM/YYYY HH24:MI'), 'agendada',
  DATE_TRUNC('day', NOW()) + INTERVAL '2 days 8 hours', 30, 'Valoracion inicial', NULL,
  'AGENDADA', 'PENDIENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'apt-6', 'pat-1', 'doc-4', 'ent-2',
  DATE_TRUNC('day', NOW()) + INTERVAL '3 days 9 hours',
  DATE_TRUNC('day', NOW()) + INTERVAL '3 days 9 hours 45 minutes',
  (DATE_TRUNC('day', NOW()) + INTERVAL '3 days')::DATE,
  (CASE EXTRACT(DOW FROM NOW() + INTERVAL '3 days') WHEN 0 THEN 'domingo' WHEN 1 THEN 'lunes' WHEN 2 THEN 'martes' WHEN 3 THEN 'miércoles' WHEN 4 THEN 'jueves' WHEN 5 THEN 'viernes' ELSE 'sábado' END),
  'Periodoncia - seguimiento', 'Valeria Rodriguez', '+57 311 444 7788', 'Dr(a). Sebastian Pulido',
  TO_CHAR(DATE_TRUNC('day',NOW()) + INTERVAL '3 days 9 hours','DD/MM/YYYY HH24:MI'), 'agendada',
  DATE_TRUNC('day', NOW()) + INTERVAL '3 days 9 hours', 45, 'Periodoncia - seguimiento', NULL,
  'AGENDADA', 'PENDIENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'apt-7', 'pat-3', 'doc-2', 'ent-3',
  DATE_TRUNC('day', NOW()) + INTERVAL '5 days 10 hours',
  DATE_TRUNC('day', NOW()) + INTERVAL '5 days 10 hours 30 minutes',
  (DATE_TRUNC('day', NOW()) + INTERVAL '5 days')::DATE,
  (CASE EXTRACT(DOW FROM NOW() + INTERVAL '5 days') WHEN 0 THEN 'domingo' WHEN 1 THEN 'lunes' WHEN 2 THEN 'martes' WHEN 3 THEN 'miércoles' WHEN 4 THEN 'jueves' WHEN 5 THEN 'viernes' ELSE 'sábado' END),
  'Ajuste brackets', 'Isabella Quintero', '+57 315 222 1100', 'Dr(a). Andres Marin',
  TO_CHAR(DATE_TRUNC('day',NOW()) + INTERVAL '5 days 10 hours','DD/MM/YYYY HH24:MI'), 'agendada',
  DATE_TRUNC('day', NOW()) + INTERVAL '5 days 10 hours', 30, 'Ajuste brackets', NULL,
  'AGENDADA', 'PENDIENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'apt-8', 'pat-2', 'doc-3', NULL,
  DATE_TRUNC('day', NOW()) - INTERVAL '2 days' + INTERVAL '10 hours',
  DATE_TRUNC('day', NOW()) - INTERVAL '2 days' + INTERVAL '11 hours',
  (DATE_TRUNC('day', NOW()) - INTERVAL '2 days')::DATE,
  (CASE EXTRACT(DOW FROM NOW() - INTERVAL '2 days') WHEN 0 THEN 'domingo' WHEN 1 THEN 'lunes' WHEN 2 THEN 'martes' WHEN 3 THEN 'miércoles' WHEN 4 THEN 'jueves' WHEN 5 THEN 'viernes' ELSE 'sábado' END),
  'Endodoncia 14', 'Mateo Gomez', '+57 320 318 9090', 'Dr(a). Carolina Rios',
  TO_CHAR(DATE_TRUNC('day',NOW()) - INTERVAL '2 days' + INTERVAL '10 hours','DD/MM/YYYY HH24:MI'), 'finalizada',
  DATE_TRUNC('day', NOW()) - INTERVAL '2 days' + INTERVAL '10 hours', 60, 'Endodoncia 14', NULL,
  'FINALIZADA', 'CONFIRMADA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'apt-9', 'pat-4', 'doc-1', 'ent-5',
  DATE_TRUNC('day', NOW()) - INTERVAL '7 days' + INTERVAL '9 hours',
  DATE_TRUNC('day', NOW()) - INTERVAL '7 days' + INTERVAL '9 hours 30 minutes',
  (DATE_TRUNC('day', NOW()) - INTERVAL '7 days')::DATE,
  (CASE EXTRACT(DOW FROM NOW() - INTERVAL '7 days') WHEN 0 THEN 'domingo' WHEN 1 THEN 'lunes' WHEN 2 THEN 'martes' WHEN 3 THEN 'miércoles' WHEN 4 THEN 'jueves' WHEN 5 THEN 'viernes' ELSE 'sábado' END),
  'Valoracion inicial ARL', 'Carlos Pacheco', '+57 300 989 4567', 'Dr(a). Laura Castillo',
  TO_CHAR(DATE_TRUNC('day',NOW()) - INTERVAL '7 days' + INTERVAL '9 hours','DD/MM/YYYY HH24:MI'), 'no_asistio',
  DATE_TRUNC('day', NOW()) - INTERVAL '7 days' + INTERVAL '9 hours', 30, 'Valoracion inicial ARL', NULL,
  'NO_ASISTIO', 'NO_RESPONDE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  'apt-10', 'pat-1', 'doc-1', 'ent-2',
  DATE_TRUNC('day', NOW()) - INTERVAL '15 days' + INTERVAL '14 hours',
  DATE_TRUNC('day', NOW()) - INTERVAL '15 days' + INTERVAL '14 hours 30 minutes',
  (DATE_TRUNC('day', NOW()) - INTERVAL '15 days')::DATE,
  (CASE EXTRACT(DOW FROM NOW() - INTERVAL '15 days') WHEN 0 THEN 'domingo' WHEN 1 THEN 'lunes' WHEN 2 THEN 'martes' WHEN 3 THEN 'miércoles' WHEN 4 THEN 'jueves' WHEN 5 THEN 'viernes' ELSE 'sábado' END),
  'Limpieza dental', 'Valeria Rodriguez', '+57 311 444 7788', 'Dr(a). Laura Castillo',
  TO_CHAR(DATE_TRUNC('day',NOW()) - INTERVAL '15 days' + INTERVAL '14 hours','DD/MM/YYYY HH24:MI'), 'finalizada',
  DATE_TRUNC('day', NOW()) - INTERVAL '15 days' + INTERVAL '14 hours', 30, 'Limpieza dental', NULL,
  'FINALIZADA', 'CONFIRMADA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
  -- DEMO: Angel Zapata — 2026-06-02 15:00 (trigger crea reminder automáticamente)
  'apt-angel', 'pat-6', 'doc-1', 'ent-1',
  '2026-06-02 15:00:00'::TIMESTAMP,
  '2026-06-02 16:00:00'::TIMESTAMP,
  '2026-06-02'::DATE,
  'martes',
  'Valoración inicial', 'Angel Zapata', '+57 305 342 7529', 'Dr(a). Laura Castillo',
  '02/06/2026 15:00', 'pendiente',
  '2026-06-02 15:00:00'::TIMESTAMP, 60, 'Valoración inicial', NULL,
  'AGENDADA', 'PENDIENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- RECORDATORIOS: creados automáticamente por trigger AFTER INSERT ON appointments.
-- Para simular estados variados en demo, actualizamos después de la inserción.
UPDATE "reminders" SET
  "estado_recordatorio"      = 'CONFIRMADO',
  "ultimo_recordatorio_tipo" = 'DIA_ANTES',
  "day_before_sent_at"       = NOW() - INTERVAL '1 day',
  "responded_at"             = NOW() - INTERVAL '1 hour',
  "response_text"            = 'Confirmo, ahí estaré.',
  "estado_cita"              = 'confirmada',
  "updated_at"               = NOW()
WHERE "appointment_id" = 'apt-1';

UPDATE "reminders" SET
  "estado_recordatorio"      = 'ENVIADO',
  "ultimo_recordatorio_tipo" = 'DIA_ANTES',
  "day_before_sent_at"       = NOW() - INTERVAL '1 day',
  "updated_at"               = NOW()
WHERE "appointment_id" = 'apt-2';

UPDATE "reminders" SET
  "estado_recordatorio"      = 'CANCELADO',
  "ultimo_recordatorio_tipo" = 'DIA_ANTES',
  "day_before_sent_at"       = NOW() - INTERVAL '1 day',
  "responded_at"             = NOW() - INTERVAL '2 hours',
  "response_text"            = 'No puedo asistir, por favor cancelar.',
  "estado_cita"              = 'cancelada',
  "updated_at"               = NOW()
WHERE "appointment_id" = 'apt-3';

UPDATE "reminders" SET
  "estado_recordatorio"      = 'NO_RESPONDE',
  "ultimo_recordatorio_tipo" = 'TRES_HORAS',
  "day_before_sent_at"       = NOW() - INTERVAL '8 days',
  "three_hours_sent_at"      = NOW() - INTERVAL '7 days',
  "no_response_checked_at"   = NOW() - INTERVAL '7 days',
  "estado_cita"              = 'no_responde',
  "updated_at"               = NOW()
WHERE "appointment_id" = 'apt-9';

UPDATE "reminders" SET
  "estado_recordatorio"      = 'REAGENDAR',
  "ultimo_recordatorio_tipo" = 'DIA_ANTES',
  "day_before_sent_at"       = NOW() - INTERVAL '1 day',
  "responded_at"             = NOW() - INTERVAL '3 hours',
  "response_text"            = 'No puedo ir hoy, ¿podemos reagendar para el viernes?',
  "estado_cita"              = 'reagendar',
  "updated_at"               = NOW()
WHERE "appointment_id" = 'apt-11';

-- CASOS CRM (8)
INSERT INTO "crm_cases" (
  "id", "patientId", "entityId", "type", "status", "nextAction", "responsible",
  "lastInteraction", "observations", "createdAt"
) VALUES
('crm-1', 'pat-3', 'ent-3', 'SOLICITUD_AUTORIZACION', 'DOCUMENTOS_PENDIENTES', 'Solicitar formato de autorizacion firmado', 'Administrador', NOW() - INTERVAL '1 day', 'Falta historia clinica firmada y soporte de afiliacion', NOW() - INTERVAL '3 days'),
('crm-2', 'pat-4', 'ent-5', 'DOCUMENTO_PENDIENTE', 'PENDIENTE_REVISION_HUMANA', 'Validar orden medica recibida', 'Administrador', NOW(), 'Cliente envio orden por WhatsApp, requiere validacion', NOW() - INTERVAL '1 day'),
('crm-3', 'pat-1', 'ent-2', 'SOLICITUD_AUTORIZACION', 'RADICADO_SOLICITADO', 'Esperar radicado MedPlus', 'Administrador', NOW() - INTERVAL '2 days', 'Solicitud radicada vía portal MedPlus', NOW() - INTERVAL '5 days'),
('crm-4', 'pat-2', NULL, 'PARTICULAR_INTERESADO', 'LISTO_PARA_AGENDAR', 'Agendar cita para tratamiento integral', 'Administrador', NOW(), 'Acepto cotizacion enviada', NOW() - INTERVAL '2 days'),
('crm-5', 'pat-5', 'ent-4', 'SOLICITUD_AUTORIZACION', 'NUEVO', 'Solicitar documentos basicos', 'Administrador', NOW(), 'Acudiente solicito agendamiento por WhatsApp', NOW()),
('crm-6', 'pat-3', 'ent-3', 'COTIZACION_PENDIENTE', 'EN_PREPARACION_DOCUMENTAL', 'Preparar paquete documental Sura', 'Administrador', NOW() - INTERVAL '1 day', 'Caso paralelo de cotizacion ortodoncia', NOW() - INTERVAL '2 days'),
('crm-7', 'pat-1', 'ent-2', 'LISTO_PARA_AGENDAR', 'AGENDADO', 'Esperar asistencia paciente', 'Administrador', NOW() - INTERVAL '1 day', 'Cita programada y confirmada', NOW() - INTERVAL '7 days'),
('crm-8', 'pat-4', 'ent-5', 'REAGENDAMIENTO', 'PERDIDO', 'Cerrar caso, paciente no respondio', 'Administrador', NOW() - INTERVAL '7 days', 'No respondio despues de 3 recordatorios', NOW() - INTERVAL '10 days');

-- PAGOS (5)
INSERT INTO "payments" (
  "id", "patientId", "concept", "amount", "method", "paidAt", "status", "observation", "createdAt"
) VALUES
('pay-1', 'pat-1', 'Periodoncia - sesion 2', 280000.00, 'Tarjeta credito', NOW() - INTERVAL '3 days', 'PAGADO', NULL, CURRENT_TIMESTAMP),
('pay-2', 'pat-2', 'Endodoncia 14', 650000.00, 'Transferencia', NOW() - INTERVAL '2 days', 'PAGADO', NULL, CURRENT_TIMESTAMP),
('pay-3', 'pat-3', 'Cuota ortodoncia mes 4', 220000.00, 'Efectivo', NOW() - INTERVAL '1 day', 'ABONO', 'Saldo pendiente $200.000', CURRENT_TIMESTAMP),
('pay-4', 'pat-5', 'Valoracion inicial', 0.00, 'Convenio', NULL, 'PENDIENTE', 'Pendiente confirmacion autorizacion', CURRENT_TIMESTAMP),
('pay-5', 'pat-1', 'Limpieza dental', 120000.00, 'Tarjeta debito', NOW() - INTERVAL '15 days', 'PAGADO', NULL, CURRENT_TIMESTAMP);

-- ARCHIVOS ADJUNTOS (8)
INSERT INTO "attached_files" (
  "id", "patientId", "fileType", "fileName", "uploadedAt", "crmCaseId"
) VALUES
('fil-1', 'pat-3', 'Orden medica', 'orden-ortodoncia-isabella.pdf', NOW() - INTERVAL '1 hour', NULL),
('fil-2', 'pat-3', 'Documento de identidad', 'cc-isabella.pdf', NOW() - INTERVAL '2 days', NULL),
('fil-3', 'pat-4', 'Autorizacion de aseguradora', 'autorizacion-arl-bolivar.pdf', NOW() - INTERVAL '1 day', NULL),
('fil-4', 'pat-1', 'Consentimiento firmado', 'consentimiento-periodoncia.pdf', NOW() - INTERVAL '5 days', NULL),
('fil-5', 'pat-1', 'Historia clinica', 'hc-valeria-2026.pdf', NOW() - INTERVAL '10 days', NULL),
('fil-6', 'pat-2', 'Soporte de pago', 'soporte-endodoncia.pdf', NOW() - INTERVAL '2 days', NULL),
('fil-7', 'pat-5', 'Documento de identidad', 'ti-juliana.pdf', NOW() - INTERVAL '2 days', NULL),
('fil-8', 'pat-3', 'Soporte de pago', 'comprobante-marzo.pdf', NOW() - INTERVAL '1 day', NULL);

-- PAQUETES DOCUMENTALES (6)
INSERT INTO "document_packs" ("id", "entityId", "label", "format") VALUES
('pkg-1', 'ent-2', 'Historia clinica', 'PDF'),
('pkg-2', 'ent-2', 'Historico de citas', 'PDF'),
('pkg-3', 'ent-2', 'Formato de autorizacion especial', 'EXCEL'),
('pkg-4', 'ent-3', 'Historia clinica', 'PDF'),
('pkg-5', 'ent-3', 'Historico de citas', 'PDF'),
('pkg-6', 'ent-3', 'Soporte de autorizacion', 'PDF');

-- CONSENTIMIENTOS (3)
INSERT INTO "consents" (
  "id", "patientId", "doctorId", "type", "consultation", "entityName", "signedAt"
) VALUES
('cons-1', 'pat-1', 'doc-4', 'PERIODONCIA', 'Periodoncia - sesion 1', 'MedPlus', NOW() - INTERVAL '30 days'),
('cons-2', 'pat-2', 'doc-3', 'ENDODONCIA', 'Endodoncia diente 14', 'Particular', NOW() - INTERVAL '3 days'),
('cons-3', 'pat-3', 'doc-2', 'PROCEDIMIENTOS_IMPLANTOLOGICOS', 'Valoracion implantologica', 'Sura', NOW() - INTERVAL '20 days');

-- CONVERSACIONES WHATSAPP (5 conversations)
INSERT INTO "whatsapp_conversations" (
  "id", "patientId", "phone", "contactName", "lastMessage", "status", "intent", "createdAt", "updatedAt"
) VALUES
('wa-1', 'pat-3', '+57 315 222 1100', 'Isabella Quintero', 'Adjunto la orden medica solicitada.', 'PENDIENTE_VALIDACION', 'SOLICITAR_AUTORIZACION', CURRENT_TIMESTAMP, NOW() - INTERVAL '1 hour'),
('wa-2', 'pat-4', '+57 300 989 4567', 'Carlos Pacheco', 'Listo, confirmo mi cita.', 'GESTION_HUMANA', 'CONFIRMAR_CITA', CURRENT_TIMESTAMP, NOW() - INTERVAL '2 hours'),
('wa-3', NULL, '+57 312 412 1188', 'Nuevo contacto', 'Quisiera saber el valor de una limpieza dental particular.', 'NUEVA', 'SOLICITAR_COTIZACION', CURRENT_TIMESTAMP, NOW() - INTERVAL '5 hours'),
('wa-4', 'pat-2', '+57 320 318 9090', 'Mateo Gomez', 'Puedo reagendar para el viernes en la tarde?', 'REQUIERE_HUMANO', 'REAGENDAR_CITA', CURRENT_TIMESTAMP, NOW() - INTERVAL '8 hours'),
('wa-5', 'pat-1', '+57 311 444 7788', 'Valeria Rodriguez', 'Confirmo!', 'FINALIZADA', 'CONFIRMAR_CITA', CURRENT_TIMESTAMP, NOW() - INTERVAL '12 hours');

-- MENSAJES WHATSAPP (12 messages)
INSERT INTO "whatsapp_messages" (
  "id", "conversationId", "direction", "body", "attachmentLabel", "createdAt"
) VALUES
('m-1', 'wa-1', 'IN', 'Hola, necesito ayuda con una autorizacion de ortodoncia.', NULL, NOW() - INTERVAL '3 hours'),
('m-2', 'wa-1', 'OUT', 'Hola Isabella, claro que si. Te ayudo a iniciar tu solicitud con Sura.', NULL, NOW() - INTERVAL '3 hours'),
('m-3', 'wa-1', 'OUT', 'Necesito tu documento de identidad y orden medica. Puedes enviarlas por aqui?', NULL, NOW() - INTERVAL '2 hours'),
('m-4', 'wa-1', 'IN', 'Adjunto la orden medica solicitada.', 'orden-medica.pdf', NOW() - INTERVAL '1 hour'),
('m-5', 'wa-2', 'OUT', 'Buen dia Carlos, le recordamos su cita manana 9:00 AM con la Dra. Carolina Rios.', NULL, NOW() - INTERVAL '4 hours'),
('m-6', 'wa-2', 'IN', 'Listo, confirmo mi cita.', NULL, NOW() - INTERVAL '2 hours'),
('m-7', 'wa-3', 'IN', 'Buenas tardes, quisiera saber el valor de una limpieza dental particular.', NULL, NOW() - INTERVAL '5 hours'),
('m-8', 'wa-4', 'IN', 'No voy a poder asistir a mi cita del miercoles.', NULL, NOW() - INTERVAL '9 hours'),
('m-9', 'wa-4', 'IN', 'Puedo reagendar para el viernes en la tarde?', NULL, NOW() - INTERVAL '8 hours'),
('m-10', 'wa-5', 'OUT', 'Hola Valeria, te confirmamos cita hoy 11:00 AM.', NULL, NOW() - INTERVAL '13 hours'),
('m-11', 'wa-5', 'IN', 'Confirmo!', NULL, NOW() - INTERVAL '12 hours');

-- ============================================================
-- 6. AÑADIR FK A APPOINTMENTS (Después de insertar CRM)
-- ============================================================
ALTER TABLE "appointments" ADD CONSTRAINT fk_crm_case
  FOREIGN KEY ("crmCaseId") REFERENCES "crm_cases"("id");

-- ============================================================
-- 7. VISTAS PARA n8n / CHATBOT
-- ============================================================

-- ── Vista 1: appointment_calendar_events
-- Formato plano de citas para calendario y n8n (fuente: start_iso / end_iso)
DROP VIEW IF EXISTS "appointment_calendar_events";
CREATE VIEW "appointment_calendar_events" AS
SELECT
  a."id"                                                          AS appointment_id,
  COALESCE(a."phone", p."cellphone", p."phone", '')              AS phone,
  COALESCE(a."name",  p."firstName" || ' ' || p."firstLastName", '') AS name,
  COALESCE(a."servicio", a."treatment", '')                      AS servicio,
  COALESCE(a."especialista_nombre",
           'Dr(a). ' || d."firstName" || ' ' || d."lastName")   AS especialista_nombre,
  COALESCE(a."fecha_texto_original",
           TO_CHAR(a."start_iso", 'DD/MM/YYYY HH24:MI'))        AS fecha_texto_original,
  a."start_iso",
  a."end_iso",
  EXTRACT(EPOCH FROM (a."end_iso" - a."start_iso"))::INT / 60    AS duration_minutes,
  a."fecha_iso_dia",
  a."dia_texto",
  a."estado_cita",
  a."status",
  a."confirmationStatus"                                         AS confirmation_status,
  a."patientId"                                                  AS patient_id,
  a."doctorId"                                                   AS doctor_id,
  a."entityId"                                                   AS entity_id
FROM "appointments" a
LEFT JOIN "patients" p ON p."id" = a."patientId"
LEFT JOIN "doctors"  d ON d."id" = a."doctorId";

-- ── Vista 2: n8n_reminders_day_before_due
-- Recordatorios PENDIENTES para citas de mañana (primer recordatorio: 1 día antes)
-- n8n la consulta cada noche para enviar el primer WhatsApp
DROP VIEW IF EXISTS "n8n_reminders_day_before_due";
CREATE VIEW "n8n_reminders_day_before_due" AS
SELECT
  r."id"                     AS reminder_id,
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
-- Recordatorios para citas que están a ~3 horas (segundo recordatorio)
-- n8n la consulta frecuentemente para enviar el segundo WhatsApp
DROP VIEW IF EXISTS "n8n_reminders_three_hours_due";
CREATE VIEW "n8n_reminders_three_hours_due" AS
SELECT
  r."id"                     AS reminder_id,
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
-- n8n los marca como NO_RESPONDE si el paciente no contestó
DROP VIEW IF EXISTS "n8n_reminders_no_response_due";
CREATE VIEW "n8n_reminders_no_response_due" AS
SELECT
  r."id"                     AS reminder_id,
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
  AND COALESCE(r."three_hours_sent_at", r."day_before_sent_at") <= NOW() - INTERVAL '30 minutes';

-- ============================================================
-- 8. VALIDACIONES FINALES
-- ============================================================
SELECT '✅ SEED COMPLETADO EXITOSAMENTE' as estado;

SELECT '════════════════════════════════════════' as titulo
UNION ALL
SELECT '📊 CONTEO DE REGISTROS INSERTADOS'
UNION ALL
SELECT '════════════════════════════════════════'
UNION ALL
SELECT '✓ Usuarios: ' || COUNT(*) FROM "users"
UNION ALL SELECT '✓ Entidades: ' || COUNT(*) FROM "entities"
UNION ALL SELECT '✓ Doctores: ' || COUNT(*) FROM "doctors"
UNION ALL SELECT '✓ Pacientes: ' || COUNT(*) FROM "patients"
UNION ALL SELECT '✓ Citas: ' || COUNT(*) FROM "appointments"
UNION ALL SELECT '✓ Recordatorios: ' || COUNT(*) FROM "reminders"
UNION ALL SELECT '✓ Casos CRM: ' || COUNT(*) FROM "crm_cases"
UNION ALL SELECT '✓ Pagos: ' || COUNT(*) FROM "payments"
UNION ALL SELECT '✓ Archivos: ' || COUNT(*) FROM "attached_files"
UNION ALL SELECT '✓ Conv. WhatsApp: ' || COUNT(*) FROM "whatsapp_conversations"
UNION ALL SELECT '✓ Msg. WhatsApp: ' || COUNT(*) FROM "whatsapp_messages"
UNION ALL SELECT '✓ Consentimientos: ' || COUNT(*) FROM "consents"
UNION ALL SELECT '✓ Paquetes Documentales: ' || COUNT(*) FROM "document_packs"
UNION ALL
SELECT '════════════════════════════════════════'
UNION ALL
SELECT 'TOTAL DE REGISTROS: ' || (
  SELECT SUM(cnt) FROM (
    SELECT COUNT(*) as cnt FROM "users"
    UNION ALL SELECT COUNT(*) FROM "entities"
    UNION ALL SELECT COUNT(*) FROM "doctors"
    UNION ALL SELECT COUNT(*) FROM "patients"
    UNION ALL SELECT COUNT(*) FROM "appointments"
    UNION ALL SELECT COUNT(*) FROM "reminders"
    UNION ALL SELECT COUNT(*) FROM "crm_cases"
    UNION ALL SELECT COUNT(*) FROM "payments"
    UNION ALL SELECT COUNT(*) FROM "attached_files"
    UNION ALL SELECT COUNT(*) FROM "whatsapp_conversations"
    UNION ALL SELECT COUNT(*) FROM "whatsapp_messages"
    UNION ALL SELECT COUNT(*) FROM "consents"
    UNION ALL SELECT COUNT(*) FROM "document_packs"
  ) t
)
UNION ALL
SELECT '════════════════════════════════════════';

-- ============================================================
-- FIN - BASE DE DATOS LISTA PARA USAR
-- ============================================================
