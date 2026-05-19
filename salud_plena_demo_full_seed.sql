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
DROP TYPE IF EXISTS "ReminderStage" CASCADE;
DROP TYPE IF EXISTS "ReminderStatus" CASCADE;
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

CREATE TYPE "ReminderStage" AS ENUM ('TRES_DIAS', 'UN_DIA', 'DOS_HORAS');

CREATE TYPE "ReminderStatus" AS ENUM (
  'PROGRAMADO',
  'ENVIADO',
  'CONFIRMADO',
  'REAGENDAMIENTO_SOLICITADO',
  'CANCELADO',
  'NO_RESPONDE'
);

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
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "doctorId" TEXT NOT NULL REFERENCES "doctors"("id"),
  "entityId" TEXT REFERENCES "entities"("id"),
  "date" TIMESTAMP NOT NULL,
  "durationMinutes" INTEGER DEFAULT 30,
  "treatment" TEXT NOT NULL,
  "observation" TEXT,
  "requestedDate" TIMESTAMP,
  "desiredDate" TIMESTAMP,
  "status" "AppointmentStatus" DEFAULT 'AGENDADA',
  "confirmationStatus" "ConfirmationStatus" DEFAULT 'PENDIENTE',
  "crmCaseId" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Recordatorios
CREATE TABLE "reminders" (
  "id" TEXT PRIMARY KEY,
  "appointmentId" TEXT NOT NULL REFERENCES "appointments"("id") ON DELETE CASCADE,
  "patientId" TEXT NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
  "stage" "ReminderStage" NOT NULL,
  "scheduledAt" TIMESTAMP NOT NULL,
  "sentAt" TIMESTAMP,
  "status" "ReminderStatus" DEFAULT 'PROGRAMADO',
  "patientReply" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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
CREATE INDEX idx_reminders_patient ON "reminders"("patientId");
CREATE INDEX idx_reminders_appointment ON "reminders"("appointmentId");
CREATE INDEX idx_whatsapp_patient ON "whatsapp_conversations"("patientId");
CREATE INDEX idx_crm_patient ON "crm_cases"("patientId");
CREATE INDEX idx_crm_status ON "crm_cases"("status");
CREATE INDEX idx_payments_patient ON "payments"("patientId");
CREATE INDEX idx_attachments_patient ON "attached_files"("patientId");
CREATE INDEX idx_consents_patient ON "consents"("patientId");

-- ============================================================
-- 5. INSERTAR DATOS
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
('pat-5', '1050506060', 'TI', 'Bogota D.C.', 'Juliana', '', 'Forero', 'Vargas', 'Femenino', '2011-11-15', 'ASEGURADORA', 'ent-4', NULL, '310 781 0011', 'j.forero.acudiente@correo.demo', 'Cl 145 #19-40', 'Cedritos', 'Bogota', 'Cundinamarca', 'NUEVO', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

-- CITAS (10)
INSERT INTO "appointments" (
  "id", "patientId", "doctorId", "entityId", "date", "durationMinutes",
  "treatment", "observation", "status", "confirmationStatus", "createdAt", "updatedAt"
) VALUES
('apt-1', 'pat-1', 'doc-1', 'ent-2', NOW() + INTERVAL '2 hours', 30, 'Limpieza dental', 'Paciente en tratamiento periodontal', 'AGENDADA', 'CONFIRMADA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('apt-2', 'pat-2', 'doc-1', NULL, NOW() + INTERVAL '4 hours', 45, 'Obturacion resina', NULL, 'AGENDADA', 'PENDIENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('apt-3', 'pat-3', 'doc-2', 'ent-3', NOW() + INTERVAL '6 hours', 60, 'Control ortodoncia', NULL, 'PENDIENTE', 'PENDIENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('apt-4', 'pat-4', 'doc-3', 'ent-5', NOW() + INTERVAL '1 day', 60, 'Endodoncia molar 26', NULL, 'AGENDADA', 'PENDIENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('apt-5', 'pat-5', 'doc-1', 'ent-4', NOW() + INTERVAL '2 days', 30, 'Valoracion inicial', NULL, 'AGENDADA', 'PENDIENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('apt-6', 'pat-1', 'doc-4', 'ent-2', NOW() + INTERVAL '3 days', 45, 'Periodoncia - seguimiento', NULL, 'AGENDADA', 'PENDIENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('apt-7', 'pat-3', 'doc-2', 'ent-3', NOW() + INTERVAL '5 days', 30, 'Ajuste brackets', NULL, 'AGENDADA', 'PENDIENTE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('apt-8', 'pat-2', 'doc-3', NULL, NOW() - INTERVAL '2 days', 60, 'Endodoncia 14', NULL, 'FINALIZADA', 'CONFIRMADA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('apt-9', 'pat-4', 'doc-1', 'ent-5', NOW() - INTERVAL '7 days', 30, 'Valoracion inicial ARL', NULL, 'NO_ASISTIO', 'NO_RESPONDE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('apt-10', 'pat-1', 'doc-1', 'ent-2', NOW() - INTERVAL '15 days', 30, 'Limpieza dental', NULL, 'FINALIZADA', 'CONFIRMADA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- RECORDATORIOS (8)
INSERT INTO "reminders" (
  "id", "appointmentId", "patientId", "stage", "scheduledAt", "sentAt",
  "status", "patientReply", "createdAt"
) VALUES
('rem-1', 'apt-1', 'pat-1', 'DOS_HORAS', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour', 'CONFIRMADO', 'Confirmo', CURRENT_TIMESTAMP),
('rem-2', 'apt-2', 'pat-2', 'DOS_HORAS', NOW() + INTERVAL '2 hours', NULL, 'PROGRAMADO', NULL, CURRENT_TIMESTAMP),
('rem-3', 'apt-4', 'pat-4', 'UN_DIA', NOW(), NULL, 'ENVIADO', NULL, CURRENT_TIMESTAMP),
('rem-4', 'apt-5', 'pat-5', 'TRES_DIAS', NOW() - INTERVAL '1 day', NULL, 'ENVIADO', NULL, CURRENT_TIMESTAMP),
('rem-5', 'apt-6', 'pat-1', 'TRES_DIAS', NOW(), NULL, 'PROGRAMADO', NULL, CURRENT_TIMESTAMP),
('rem-6', 'apt-7', 'pat-3', 'TRES_DIAS', NOW() + INTERVAL '2 days', NULL, 'PROGRAMADO', NULL, CURRENT_TIMESTAMP),
('rem-7', 'apt-9', 'pat-4', 'DOS_HORAS', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', 'NO_RESPONDE', NULL, CURRENT_TIMESTAMP),
('rem-8', 'apt-3', 'pat-3', 'DOS_HORAS', NOW() + INTERVAL '4 hours', NULL, 'PROGRAMADO', NULL, CURRENT_TIMESTAMP);

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
-- 7. VALIDACIONES FINALES
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
