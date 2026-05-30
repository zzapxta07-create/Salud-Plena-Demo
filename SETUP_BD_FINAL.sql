-- ============================================================
-- SALUD PLENA DEMO - SETUP BD COMPLETO
-- Compatible con PostgreSQL 12+
-- Ejecutable en: Adminer / psql / pgAdmin
-- NO TOCA tablas de n8n
-- ============================================================

-- ============================================================
-- 1. LIMPIEZA SEGURA (Solo tablas del proyecto)
-- ============================================================
DROP TABLE IF EXISTS "WhatsappMessage" CASCADE;
DROP TABLE IF EXISTS "WhatsappConversation" CASCADE;
DROP TABLE IF EXISTS "Reminder" CASCADE;
DROP TABLE IF EXISTS "AttachedFile" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "Consent" CASCADE;
DROP TABLE IF EXISTS "DocumentPack" CASCADE;
DROP TABLE IF EXISTS "Appointment" CASCADE;
DROP TABLE IF EXISTS "CrmCase" CASCADE;
DROP TABLE IF EXISTS "OdontologiaOdontograma" CASCADE;
DROP TABLE IF EXISTS "OdontologiaHistorico" CASCADE;
DROP TABLE IF EXISTS "OdontologiaEvolucion" CASCADE;
DROP TABLE IF EXISTS "OdontologiaHistoriaClinica" CASCADE;
DROP TABLE IF EXISTS "OdontologiaValoracion" CASCADE;
DROP TABLE IF EXISTS "OrtodonciaOdontograma" CASCADE;
DROP TABLE IF EXISTS "OrtodonciaHistorico" CASCADE;
DROP TABLE IF EXISTS "OrtodonciaEvolucion" CASCADE;
DROP TABLE IF EXISTS "OrtodonciaHistoriaClinica" CASCADE;
DROP TABLE IF EXISTS "OrtodonciaValoracion" CASCADE;
DROP TABLE IF EXISTS "Patient" CASCADE;
DROP TABLE IF EXISTS "Doctor" CASCADE;
DROP TABLE IF EXISTS "Entity" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

DROP VIEW IF EXISTS "n8n_calendar_appointments" CASCADE;
DROP VIEW IF EXISTS "n8n_pending_reminders" CASCADE;

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
-- 2. CREAR ENUMS (Prisma usa nombres con comillas dobles)
-- ============================================================
CREATE TYPE "UserRole" AS ENUM ('ADMINISTRADOR');
CREATE TYPE "PatientType" AS ENUM ('PARTICULAR','ASEGURADORA','ARL','CONVENIO');
CREATE TYPE "PatientStatus" AS ENUM ('NUEVO','ACTIVO','EN_AUTORIZACION','PENDIENTE_DOCUMENTOS','AGENDADO','EN_TRATAMIENTO','FINALIZADO','INACTIVO');
CREATE TYPE "AppointmentStatus" AS ENUM ('AGENDADA','CANCELADA','FINALIZADA','PENDIENTE','CONFIRMADA','SIN_RESPUESTA','REAGENDAR','NO_ASISTIO');
CREATE TYPE "ConfirmationStatus" AS ENUM ('PENDIENTE','CONFIRMADA','REAGENDAMIENTO_SOLICITADO','CANCELADA','NO_RESPONDE');
CREATE TYPE "ReminderStage" AS ENUM ('TRES_DIAS','UN_DIA','DOS_HORAS');
CREATE TYPE "ReminderStatus" AS ENUM ('PROGRAMADO','ENVIADO','CONFIRMADO','REAGENDAMIENTO_SOLICITADO','CANCELADO','NO_RESPONDE');
CREATE TYPE "WaConversationStatus" AS ENUM ('NUEVA','ATENCION_IA','REQUIERE_HUMANO','GESTION_HUMANA','FINALIZADA','PENDIENTE_DOCUMENTO','PENDIENTE_DATOS','PENDIENTE_VALIDACION');
CREATE TYPE "WaIntent" AS ENUM ('AGENDAR_CITA','CANCELAR_CITA','REAGENDAR_CITA','SOLICITAR_AUTORIZACION','ENVIAR_DOCUMENTOS','SOLICITAR_COTIZACION','HABLAR_CON_ASESOR','CONFIRMAR_CITA');
CREATE TYPE "CrmCaseType" AS ENUM ('SOLICITUD_AUTORIZACION','PARTICULAR_INTERESADO','COTIZACION_PENDIENTE','REAGENDAMIENTO','CANCELACION','DOCUMENTO_PENDIENTE','RADICADO_PENDIENTE','LISTO_PARA_AGENDAR');
CREATE TYPE "CrmStatus" AS ENUM ('NUEVO','DATOS_INCOMPLETOS','DOCUMENTOS_PENDIENTES','PENDIENTE_REVISION_HUMANA','EN_PREPARACION_DOCUMENTAL','RADICADO_SOLICITADO','RADICADO_RECIBIDO','LISTO_PARA_AGENDAR','AGENDADO','CONFIRMADO','FINALIZADO','PERDIDO');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDIENTE','PAGADO','ABONO','ANULADO');
CREATE TYPE "ConsentType" AS ENUM ('ANESTESIA_LOCAL','ODONTOLOGIA_RESTAURADORA','ENDODONCIA','EXODONCIA_SIMPLE','PERIODONCIA','PROMOCION_PREVENCION','PROCEDIMIENTOS_IMPLANTOLOGICOS','COVID_19');

-- ============================================================
-- 3. CREAR TABLAS (Nombres en PascalCase como espera Prisma)
-- ============================================================

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'ADMINISTRADOR',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Entity" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "type" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "Doctor" (
  "id" TEXT PRIMARY KEY,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "specialty" TEXT NOT NULL,
  "email" TEXT UNIQUE,
  "phone" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Patient" (
  "id" TEXT PRIMARY KEY,
  "documentNumber" TEXT UNIQUE NOT NULL,
  "documentType" TEXT NOT NULL,
  "expeditionPlace" TEXT,
  "firstName" TEXT NOT NULL,
  "middleName" TEXT,
  "firstLastName" TEXT NOT NULL,
  "secondLastName" TEXT,
  "gender" TEXT NOT NULL,
  "birthDate" TIMESTAMP(3) NOT NULL,
  "patientType" "PatientType" NOT NULL,
  "entityId" TEXT REFERENCES "Entity"("id"),
  "phone" TEXT,
  "cellphone" TEXT,
  "email" TEXT,
  "address" TEXT,
  "neighborhood" TEXT,
  "city" TEXT,
  "state" TEXT,
  "photoUrl" TEXT,
  "status" "PatientStatus" NOT NULL DEFAULT 'NUEVO',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedBy" TEXT
);

CREATE TABLE "CrmCase" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "entityId" TEXT REFERENCES "Entity"("id"),
  "type" "CrmCaseType" NOT NULL,
  "status" "CrmStatus" NOT NULL DEFAULT 'NUEVO',
  "nextAction" TEXT,
  "responsible" TEXT,
  "lastInteraction" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "observations" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Appointment" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "doctorId" TEXT NOT NULL REFERENCES "Doctor"("id"),
  "entityId" TEXT REFERENCES "Entity"("id"),
  "date" TIMESTAMP(3) NOT NULL,
  "durationMinutes" INTEGER NOT NULL DEFAULT 30,
  "treatment" TEXT NOT NULL,
  "observation" TEXT,
  "requestedDate" TIMESTAMP(3),
  "desiredDate" TIMESTAMP(3),
  "status" "AppointmentStatus" NOT NULL DEFAULT 'AGENDADA',
  "confirmationStatus" "ConfirmationStatus" NOT NULL DEFAULT 'PENDIENTE',
  "crmCaseId" TEXT REFERENCES "CrmCase"("id"),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Reminder" (
  "id" TEXT PRIMARY KEY,
  "appointmentId" TEXT NOT NULL REFERENCES "Appointment"("id") ON DELETE CASCADE,
  "patientId" TEXT NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "stage" "ReminderStage" NOT NULL,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "sentAt" TIMESTAMP(3),
  "status" "ReminderStatus" NOT NULL DEFAULT 'PROGRAMADO',
  "patientReply" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "WhatsappConversation" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT REFERENCES "Patient"("id"),
  "phone" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "lastMessage" TEXT,
  "status" "WaConversationStatus" NOT NULL DEFAULT 'NUEVA',
  "intent" "WaIntent",
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "WhatsappMessage" (
  "id" TEXT PRIMARY KEY,
  "conversationId" TEXT NOT NULL REFERENCES "WhatsappConversation"("id") ON DELETE CASCADE,
  "direction" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "attachmentLabel" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Payment" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "concept" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "method" TEXT NOT NULL,
  "paidAt" TIMESTAMP(3),
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDIENTE',
  "observation" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AttachedFile" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "fileType" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "crmCaseId" TEXT REFERENCES "CrmCase"("id")
);

CREATE TABLE "DocumentPack" (
  "id" TEXT PRIMARY KEY,
  "entityId" TEXT NOT NULL REFERENCES "Entity"("id"),
  "label" TEXT NOT NULL,
  "format" TEXT NOT NULL
);

CREATE TABLE "Consent" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "doctorId" TEXT REFERENCES "Doctor"("id"),
  "type" "ConsentType" NOT NULL,
  "consultation" TEXT,
  "entityName" TEXT,
  "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Odontología
CREATE TABLE "OdontologiaValoracion" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "generalNotes" TEXT,
  "teethStates" JSONB NOT NULL,
  "doctorName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "OdontologiaHistoriaClinica" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "OdontologiaEvolucion" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "treatment" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "doctorName" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "signedByDoc" BOOLEAN NOT NULL DEFAULT false,
  "signedByPat" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE "OdontologiaHistorico" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "date" TIMESTAMP(3) NOT NULL,
  "motive" TEXT NOT NULL,
  "doctorName" TEXT NOT NULL,
  "observation" TEXT,
  "procedures" TEXT
);

CREATE TABLE "OdontologiaOdontograma" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "teethStates" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ortodoncia
CREATE TABLE "OrtodonciaValoracion" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "generalNotes" TEXT,
  "teethStates" JSONB NOT NULL,
  "doctorName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "OrtodonciaHistoriaClinica" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "OrtodonciaEvolucion" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "treatment" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "doctorName" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "signedByDoc" BOOLEAN NOT NULL DEFAULT false,
  "signedByPat" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE "OrtodonciaHistorico" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "date" TIMESTAMP(3) NOT NULL,
  "motive" TEXT NOT NULL,
  "doctorName" TEXT NOT NULL,
  "observation" TEXT,
  "procedures" TEXT
);

CREATE TABLE "OrtodonciaOdontograma" (
  "id" TEXT PRIMARY KEY,
  "patientId" TEXT NOT NULL REFERENCES "Patient"("id") ON DELETE CASCADE,
  "teethStates" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. ÍNDICES
-- ============================================================
CREATE INDEX "idx_Patient_documentNumber" ON "Patient"("documentNumber");
CREATE INDEX "idx_Patient_status" ON "Patient"("status");
CREATE INDEX "idx_Patient_entityId" ON "Patient"("entityId");
CREATE INDEX "idx_Appointment_patientId" ON "Appointment"("patientId");
CREATE INDEX "idx_Appointment_doctorId" ON "Appointment"("doctorId");
CREATE INDEX "idx_Appointment_date" ON "Appointment"("date");
CREATE INDEX "idx_Appointment_doctor_date" ON "Appointment"("doctorId","date");
CREATE INDEX "idx_Appointment_status_date" ON "Appointment"("status","date");
CREATE INDEX "idx_Reminder_patientId" ON "Reminder"("patientId");
CREATE INDEX "idx_Reminder_appointmentId" ON "Reminder"("appointmentId");
CREATE INDEX "idx_Reminder_scheduled" ON "Reminder"("scheduledAt","status");
CREATE INDEX "idx_CrmCase_patientId" ON "CrmCase"("patientId");
CREATE INDEX "idx_CrmCase_status" ON "CrmCase"("status");
CREATE INDEX "idx_Payment_patientId" ON "Payment"("patientId");
CREATE INDEX "idx_AttachedFile_patientId" ON "AttachedFile"("patientId");
CREATE INDEX "idx_Consent_patientId" ON "Consent"("patientId");
CREATE INDEX "idx_WhatsappConversation_patientId" ON "WhatsappConversation"("patientId");

-- ============================================================
-- 5. DATOS DEMO
-- ============================================================

INSERT INTO "User" ("id","email","name","role") VALUES
('user-admin','admin@saludplena.demo','Administrador','ADMINISTRADOR');

INSERT INTO "Entity" ("id","name","type","active") VALUES
('ent-1','Particular','Particular',true),
('ent-2','MedPlus','Aseguradora',true),
('ent-3','Sura','Aseguradora',true),
('ent-4','Salud Total','Aseguradora',true),
('ent-5','ARL Bolivar','ARL',true);

INSERT INTO "Doctor" ("id","firstName","lastName","specialty","email","phone","active") VALUES
('doc-1','Laura','Castillo','Odontologia general','laura.c@saludplena.demo','300 555 1001',true),
('doc-2','Andres','Marin','Ortodoncia','andres.m@saludplena.demo','300 555 1002',true),
('doc-3','Carolina','Rios','Endodoncia','caro.r@saludplena.demo','300 555 1003',true),
('doc-4','Sebastian','Pulido','Periodoncia / Implantes','seb.p@saludplena.demo','300 555 1004',true);

INSERT INTO "Patient" (
  "id","documentNumber","documentType","expeditionPlace","firstName","middleName",
  "firstLastName","secondLastName","gender","birthDate","patientType","entityId",
  "phone","cellphone","email","address","neighborhood","city","state","status"
) VALUES
('pat-1','1010101010','CC','Bogota D.C.','Valeria','','Rodriguez','Beltran','Femenino','1992-04-12','ASEGURADORA','ent-2','601 555 4400','311 444 7788','valeria.r@correo.demo','Cra 11 #84-30 Apto 502','El Nogal','Bogota','Cundinamarca','EN_TRATAMIENTO'),
('pat-2','1020203030','CC','Medellin','Mateo',NULL,'Gomez','Henao','Masculino','1988-09-22','PARTICULAR','ent-1',NULL,'320 318 9090','mateo.g@correo.demo','Cl 10 #43A-22','Poblado','Medellin','Antioquia','AGENDADO'),
('pat-3','1030304040','CC','Cali','Isabella','Sofia','Quintero','Mosquera','Femenino','2002-01-30','ASEGURADORA','ent-3',NULL,'315 222 1100','isabella.q@correo.demo','Av 6N #25-10','Granada','Cali','Valle del Cauca','EN_AUTORIZACION'),
('pat-4','1040405050','CC','Barranquilla','Carlos',NULL,'Pacheco','Olivares','Masculino','1975-06-04','ARL','ent-5',NULL,'300 989 4567','carlos.p@correo.demo','Cl 84 #50-21','Riomar','Barranquilla','Atlantico','PENDIENTE_DOCUMENTOS'),
('pat-5','1050506060','TI','Bogota D.C.','Juliana',NULL,'Forero','Vargas','Femenino','2011-11-15','ASEGURADORA','ent-4',NULL,'310 781 0011','j.forero.acudiente@correo.demo','Cl 145 #19-40','Cedritos','Bogota','Cundinamarca','NUEVO');

INSERT INTO "Appointment" (
  "id","patientId","doctorId","entityId","date","durationMinutes",
  "treatment","observation","status","confirmationStatus"
) VALUES
('apt-1','pat-1','doc-1','ent-2',CURRENT_DATE + INTERVAL '9 hours',30,'Limpieza dental','Paciente en tratamiento periodontal','AGENDADA','CONFIRMADA'),
('apt-2','pat-2','doc-1',NULL,CURRENT_DATE + INTERVAL '10 hours',45,'Obturacion resina',NULL,'AGENDADA','PENDIENTE'),
('apt-3','pat-3','doc-2','ent-3',CURRENT_DATE + INTERVAL '11 hours',60,'Control ortodoncia',NULL,'PENDIENTE','PENDIENTE'),
('apt-11','pat-4','doc-3','ent-5',CURRENT_DATE + INTERVAL '14 hours',45,'Evaluacion endodoncia',NULL,'AGENDADA','CONFIRMADA'),
('apt-12','pat-5','doc-4','ent-4',CURRENT_DATE + INTERVAL '15 hours',60,'Periodoncia - sesion 1',NULL,'AGENDADA','PENDIENTE'),
('apt-4','pat-4','doc-3','ent-5',CURRENT_DATE + INTERVAL '1 day' + INTERVAL '9 hours',60,'Endodoncia molar 26',NULL,'AGENDADA','PENDIENTE'),
('apt-13','pat-1','doc-1','ent-2',CURRENT_DATE + INTERVAL '1 day' + INTERVAL '10 hours',30,'Limpieza dental',NULL,'AGENDADA','CONFIRMADA'),
('apt-14','pat-2','doc-2',NULL,CURRENT_DATE + INTERVAL '1 day' + INTERVAL '13 hours',45,'Valoracion ortodoncia',NULL,'AGENDADA','PENDIENTE'),
('apt-5','pat-5','doc-1','ent-4',CURRENT_DATE + INTERVAL '2 days' + INTERVAL '8 hours',30,'Valoracion inicial',NULL,'AGENDADA','PENDIENTE'),
('apt-15','pat-3','doc-4','ent-3',CURRENT_DATE + INTERVAL '2 days' + INTERVAL '11 hours',90,'Periodoncia - procedimiento',NULL,'AGENDADA','CONFIRMADA'),
('apt-6','pat-1','doc-4','ent-2',CURRENT_DATE + INTERVAL '3 days' + INTERVAL '9 hours',45,'Periodoncia - seguimiento',NULL,'AGENDADA','PENDIENTE'),
('apt-16','pat-4','doc-1','ent-5',CURRENT_DATE + INTERVAL '3 days' + INTERVAL '14 hours',30,'Control post-endodoncia',NULL,'AGENDADA','PENDIENTE'),
('apt-7','pat-3','doc-2','ent-3',CURRENT_DATE + INTERVAL '5 days' + INTERVAL '10 hours',30,'Ajuste brackets',NULL,'AGENDADA','PENDIENTE'),
('apt-17','pat-2','doc-3',NULL,CURRENT_DATE + INTERVAL '5 days' + INTERVAL '15 hours',60,'Endodoncia 15',NULL,'AGENDADA','CONFIRMADA'),
('apt-8','pat-2','doc-3',NULL,CURRENT_DATE - INTERVAL '2 days' + INTERVAL '10 hours',60,'Endodoncia 14',NULL,'FINALIZADA','CONFIRMADA'),
('apt-9','pat-4','doc-1','ent-5',CURRENT_DATE - INTERVAL '7 days' + INTERVAL '9 hours',30,'Valoracion inicial ARL',NULL,'NO_ASISTIO','NO_RESPONDE'),
('apt-10','pat-1','doc-1','ent-2',CURRENT_DATE - INTERVAL '15 days' + INTERVAL '14 hours',30,'Limpieza dental',NULL,'FINALIZADA','CONFIRMADA'),
('apt-18','pat-3','doc-2','ent-3',CURRENT_DATE - INTERVAL '5 days' + INTERVAL '11 hours',60,'Control ortodoncia',NULL,'FINALIZADA','CONFIRMADA');

INSERT INTO "Reminder" (
  "id","appointmentId","patientId","stage","scheduledAt","sentAt","status","patientReply"
) VALUES
('rem-1','apt-1','pat-1','DOS_HORAS',CURRENT_TIMESTAMP - INTERVAL '1 hour',CURRENT_TIMESTAMP - INTERVAL '1 hour','CONFIRMADO','Confirmo'),
('rem-2','apt-2','pat-2','DOS_HORAS',CURRENT_TIMESTAMP + INTERVAL '2 hours',NULL,'PROGRAMADO',NULL),
('rem-3','apt-4','pat-4','UN_DIA',CURRENT_TIMESTAMP,NULL,'ENVIADO',NULL),
('rem-4','apt-5','pat-5','TRES_DIAS',CURRENT_TIMESTAMP - INTERVAL '1 day',NULL,'ENVIADO',NULL),
('rem-5','apt-6','pat-1','TRES_DIAS',CURRENT_TIMESTAMP,NULL,'PROGRAMADO',NULL),
('rem-6','apt-7','pat-3','TRES_DIAS',CURRENT_TIMESTAMP + INTERVAL '2 days',NULL,'PROGRAMADO',NULL),
('rem-7','apt-9','pat-4','DOS_HORAS',CURRENT_TIMESTAMP - INTERVAL '7 days',CURRENT_TIMESTAMP - INTERVAL '7 days','NO_RESPONDE',NULL),
('rem-8','apt-3','pat-3','DOS_HORAS',CURRENT_TIMESTAMP + INTERVAL '4 hours',NULL,'PROGRAMADO',NULL);

INSERT INTO "CrmCase" (
  "id","patientId","entityId","type","status","nextAction","responsible",
  "lastInteraction","observations"
) VALUES
('crm-1','pat-3','ent-3','SOLICITUD_AUTORIZACION','DOCUMENTOS_PENDIENTES','Solicitar formato de autorizacion firmado','Administrador',CURRENT_TIMESTAMP - INTERVAL '1 day','Falta historia clinica firmada y soporte de afiliacion'),
('crm-2','pat-4','ent-5','DOCUMENTO_PENDIENTE','PENDIENTE_REVISION_HUMANA','Validar orden medica recibida','Administrador',CURRENT_TIMESTAMP,'Cliente envio orden por WhatsApp, requiere validacion'),
('crm-3','pat-1','ent-2','SOLICITUD_AUTORIZACION','RADICADO_SOLICITADO','Esperar radicado MedPlus','Administrador',CURRENT_TIMESTAMP - INTERVAL '2 days','Solicitud radicada via portal MedPlus'),
('crm-4','pat-2',NULL,'PARTICULAR_INTERESADO','LISTO_PARA_AGENDAR','Agendar cita para tratamiento integral','Administrador',CURRENT_TIMESTAMP,'Acepto cotizacion enviada'),
('crm-5','pat-5','ent-4','SOLICITUD_AUTORIZACION','NUEVO','Solicitar documentos basicos','Administrador',CURRENT_TIMESTAMP,'Acudiente solicito agendamiento por WhatsApp'),
('crm-6','pat-3','ent-3','COTIZACION_PENDIENTE','EN_PREPARACION_DOCUMENTAL','Preparar paquete documental Sura','Administrador',CURRENT_TIMESTAMP - INTERVAL '1 day','Caso paralelo de cotizacion ortodoncia'),
('crm-7','pat-1','ent-2','LISTO_PARA_AGENDAR','AGENDADO','Esperar asistencia paciente','Administrador',CURRENT_TIMESTAMP - INTERVAL '1 day','Cita programada y confirmada'),
('crm-8','pat-4','ent-5','REAGENDAMIENTO','PERDIDO','Cerrar caso, paciente no respondio','Administrador',CURRENT_TIMESTAMP - INTERVAL '7 days','No respondio despues de 3 recordatorios');

INSERT INTO "Payment" (
  "id","patientId","concept","amount","method","paidAt","status","observation"
) VALUES
('pay-1','pat-1','Periodoncia - sesion 2',280000.00,'Tarjeta credito',CURRENT_TIMESTAMP - INTERVAL '3 days','PAGADO',NULL),
('pay-2','pat-2','Endodoncia 14',650000.00,'Transferencia',CURRENT_TIMESTAMP - INTERVAL '2 days','PAGADO',NULL),
('pay-3','pat-3','Cuota ortodoncia mes 4',220000.00,'Efectivo',CURRENT_TIMESTAMP - INTERVAL '1 day','ABONO','Saldo pendiente $200.000'),
('pay-4','pat-5','Valoracion inicial',0.00,'Convenio',NULL,'PENDIENTE','Pendiente confirmacion autorizacion'),
('pay-5','pat-1','Limpieza dental',120000.00,'Tarjeta debito',CURRENT_TIMESTAMP - INTERVAL '15 days','PAGADO',NULL);

INSERT INTO "AttachedFile" ("id","patientId","fileType","fileName","uploadedAt") VALUES
('fil-1','pat-3','Orden medica','orden-ortodoncia-isabella.pdf',CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('fil-2','pat-3','Documento de identidad','cc-isabella.pdf',CURRENT_TIMESTAMP - INTERVAL '2 days'),
('fil-3','pat-4','Autorizacion de aseguradora','autorizacion-arl-bolivar.pdf',CURRENT_TIMESTAMP - INTERVAL '1 day'),
('fil-4','pat-1','Consentimiento firmado','consentimiento-periodoncia.pdf',CURRENT_TIMESTAMP - INTERVAL '5 days'),
('fil-5','pat-1','Historia clinica','hc-valeria-2026.pdf',CURRENT_TIMESTAMP - INTERVAL '10 days'),
('fil-6','pat-2','Soporte de pago','soporte-endodoncia.pdf',CURRENT_TIMESTAMP - INTERVAL '2 days'),
('fil-7','pat-5','Documento de identidad','ti-juliana.pdf',CURRENT_TIMESTAMP - INTERVAL '2 days'),
('fil-8','pat-3','Soporte de pago','comprobante-marzo.pdf',CURRENT_TIMESTAMP - INTERVAL '1 day');

INSERT INTO "DocumentPack" ("id","entityId","label","format") VALUES
('pkg-1','ent-2','Historia clinica','PDF'),
('pkg-2','ent-2','Historico de citas','PDF'),
('pkg-3','ent-2','Formato de autorizacion especial','EXCEL'),
('pkg-4','ent-3','Historia clinica','PDF'),
('pkg-5','ent-3','Historico de citas','PDF'),
('pkg-6','ent-3','Soporte de autorizacion','PDF');

INSERT INTO "Consent" (
  "id","patientId","doctorId","type","consultation","entityName","signedAt"
) VALUES
('cons-1','pat-1','doc-4','PERIODONCIA','Periodoncia - sesion 1','MedPlus',CURRENT_TIMESTAMP - INTERVAL '30 days'),
('cons-2','pat-2','doc-3','ENDODONCIA','Endodoncia diente 14','Particular',CURRENT_TIMESTAMP - INTERVAL '3 days'),
('cons-3','pat-3','doc-2','PROCEDIMIENTOS_IMPLANTOLOGICOS','Valoracion implantologica','Sura',CURRENT_TIMESTAMP - INTERVAL '20 days');

INSERT INTO "WhatsappConversation" (
  "id","patientId","phone","contactName","lastMessage","status","intent"
) VALUES
('wa-1','pat-3','+57 315 222 1100','Isabella Quintero','Adjunto la orden medica solicitada.','PENDIENTE_VALIDACION','SOLICITAR_AUTORIZACION'),
('wa-2','pat-4','+57 300 989 4567','Carlos Pacheco','Listo, confirmo mi cita.','GESTION_HUMANA','CONFIRMAR_CITA'),
('wa-3',NULL,'+57 312 412 1188','Nuevo contacto','Quisiera saber el valor de una limpieza dental particular.','NUEVA','SOLICITAR_COTIZACION'),
('wa-4','pat-2','+57 320 318 9090','Mateo Gomez','Puedo reagendar para el viernes en la tarde?','REQUIERE_HUMANO','REAGENDAR_CITA'),
('wa-5','pat-1','+57 311 444 7788','Valeria Rodriguez','Confirmo!','FINALIZADA','CONFIRMAR_CITA');

INSERT INTO "WhatsappMessage" (
  "id","conversationId","direction","body","attachmentLabel"
) VALUES
('m-1','wa-1','IN','Hola, necesito ayuda con una autorizacion de ortodoncia.',NULL),
('m-2','wa-1','OUT','Hola Isabella, claro que si. Te ayudo a iniciar tu solicitud con Sura.',NULL),
('m-3','wa-1','OUT','Necesito tu documento de identidad y orden medica. Puedes enviarlas por aqui?',NULL),
('m-4','wa-1','IN','Adjunto la orden medica solicitada.','orden-medica.pdf'),
('m-5','wa-2','OUT','Buen dia Carlos, le recordamos su cita manana 9:00 AM con la Dra. Carolina Rios.',NULL),
('m-6','wa-2','IN','Listo, confirmo mi cita.',NULL),
('m-7','wa-3','IN','Buenas tardes, quisiera saber el valor de una limpieza dental particular.',NULL),
('m-8','wa-4','IN','No voy a poder asistir a mi cita del miercoles.',NULL),
('m-9','wa-4','IN','Puedo reagendar para el viernes en la tarde?',NULL),
('m-10','wa-5','OUT','Hola Valeria, te confirmamos cita hoy 11:00 AM.',NULL),
('m-11','wa-5','IN','Confirmo!',NULL);

-- ============================================================
-- 6. VISTAS PARA n8n
-- ============================================================

CREATE OR REPLACE VIEW "n8n_calendar_appointments" AS
SELECT
  a."id" as appointment_id,
  a."date" as appointment_date_iso,
  a."durationMinutes" as duration_minutes,
  EXTRACT(HOUR FROM a."date") as start_hour,
  EXTRACT(MINUTE FROM a."date") as start_minute,
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
FROM "Appointment" a
JOIN "Patient" p ON a."patientId" = p."id"
JOIN "Doctor" d ON a."doctorId" = d."id"
LEFT JOIN "Entity" e ON a."entityId" = e."id"
ORDER BY a."date" ASC;

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
FROM "Reminder" r
JOIN "Appointment" a ON r."appointmentId" = a."id"
JOIN "Patient" p ON r."patientId" = p."id"
JOIN "Doctor" d ON a."doctorId" = d."id"
LEFT JOIN "Entity" e ON a."entityId" = e."id"
WHERE r."status" IN ('PROGRAMADO', 'ENVIADO')
ORDER BY a."date" ASC;

-- ============================================================
-- 7. VALIDACIÓN FINAL
-- ============================================================
SELECT '✅ BD LISTA PARA SALUD PLENA DEMO' as estado;
SELECT 'Pacientes: ' || COUNT(*) as conteo FROM "Patient";
SELECT 'Doctores: ' || COUNT(*) as conteo FROM "Doctor";
SELECT 'Citas: ' || COUNT(*) as conteo FROM "Appointment";
SELECT 'Recordatorios: ' || COUNT(*) as conteo FROM "Reminder";
SELECT 'CRM: ' || COUNT(*) as conteo FROM "CrmCase";
