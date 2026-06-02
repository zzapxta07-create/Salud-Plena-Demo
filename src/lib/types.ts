export type PatientType = "PARTICULAR" | "ASEGURADORA" | "ARL" | "CONVENIO";

export type PatientStatus =
  | "NUEVO"
  | "ACTIVO"
  | "EN_AUTORIZACION"
  | "PENDIENTE_DOCUMENTOS"
  | "AGENDADO"
  | "EN_TRATAMIENTO"
  | "FINALIZADO"
  | "INACTIVO";

export type AppointmentStatus =
  | "AGENDADA"
  | "CANCELADA"
  | "FINALIZADA"
  | "PENDIENTE"
  | "CONFIRMADA"
  | "SIN_RESPUESTA"
  | "REAGENDAR"
  | "NO_ASISTIO";

export type ConfirmationStatus =
  | "PENDIENTE"
  | "CONFIRMADA"
  | "REAGENDAMIENTO_SOLICITADO"
  | "CANCELADA"
  | "NO_RESPONDE";

export type ReminderEstado =
  | "PENDIENTE"
  | "ENVIADO"
  | "CONFIRMADO"
  | "NO_RESPONDE"
  | "REAGENDAR"
  | "CANCELADO";

export type ReminderTipo = "DIA_ANTES" | "TRES_HORAS";

export type CrmStatus =
  | "NUEVO"
  | "DATOS_INCOMPLETOS"
  | "DOCUMENTOS_PENDIENTES"
  | "PENDIENTE_REVISION_HUMANA"
  | "EN_PREPARACION_DOCUMENTAL"
  | "RADICADO_SOLICITADO"
  | "RADICADO_RECIBIDO"
  | "LISTO_PARA_AGENDAR"
  | "AGENDADO"
  | "CONFIRMADO"
  | "FINALIZADO"
  | "PERDIDO";

export type CrmCaseType =
  | "SOLICITUD_AUTORIZACION"
  | "PARTICULAR_INTERESADO"
  | "COTIZACION_PENDIENTE"
  | "REAGENDAMIENTO"
  | "CANCELACION"
  | "DOCUMENTO_PENDIENTE"
  | "RADICADO_PENDIENTE"
  | "LISTO_PARA_AGENDAR";

export type WaConversationStatus =
  | "NUEVA"
  | "ATENCION_IA"
  | "REQUIERE_HUMANO"
  | "GESTION_HUMANA"
  | "FINALIZADA"
  | "PENDIENTE_DOCUMENTO"
  | "PENDIENTE_DATOS"
  | "PENDIENTE_VALIDACION";

export type WaIntent =
  | "AGENDAR_CITA"
  | "CANCELAR_CITA"
  | "REAGENDAR_CITA"
  | "SOLICITAR_AUTORIZACION"
  | "ENVIAR_DOCUMENTOS"
  | "SOLICITAR_COTIZACION"
  | "HABLAR_CON_ASESOR"
  | "CONFIRMAR_CITA";

export type PaymentStatus = "PENDIENTE" | "PAGADO" | "ABONO" | "ANULADO";

export type ConsentType =
  | "ANESTESIA_LOCAL"
  | "ODONTOLOGIA_RESTAURADORA"
  | "ENDODONCIA"
  | "EXODONCIA_SIMPLE"
  | "PERIODONCIA"
  | "PROMOCION_PREVENCION"
  | "PROCEDIMIENTOS_IMPLANTOLOGICOS"
  | "COVID_19";

export interface Patient {
  id: string;
  documentNumber: string;
  documentType: string;
  expeditionPlace?: string;
  firstName: string;
  middleName?: string;
  firstLastName: string;
  secondLastName?: string;
  gender: string;
  birthDate: string;
  patientType: PatientType;
  entityId?: string;
  entityName?: string;
  phone?: string;
  cellphone?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  photoUrl?: string;
  status: PatientStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  email?: string;
  phone?: string;
  active: boolean;
}

export interface Entity {
  id: string;
  name: string;
  type: string;
  active: boolean;
}

export interface Appointment {
  id: string;
  // n8n-compatible flat fields — fuente principal del calendario
  startIso: string;
  endIso: string;
  fechaIsoDia: string;
  diaTexto?: string;
  servicio?: string;
  name?: string;
  phone?: string;
  especialistaNombre?: string;
  fechaTextoOriginal?: string;
  estadoCita?: string;
  // Relaciones (opcionales para citas creadas por n8n sin paciente previo)
  patientId?: string;
  doctorId?: string;
  entityId?: string;
  // Campos legacy — mantenidos para compatibilidad con otros módulos
  date?: string;
  durationMinutes?: number;
  treatment?: string;
  observation?: string;
  // Campos de sistema
  status: AppointmentStatus;
  confirmationStatus: ConfirmationStatus;
}

export interface Reminder {
  id: string;
  // Referencia a cita
  appointmentId?: string;
  patientId?: string;
  doctorId?: string;
  entityId?: string;
  // Campos espejo de la cita
  phone?: string;
  name?: string;
  servicio?: string;
  especialistaNombre?: string;
  fechaTextoOriginal?: string;
  startIso: string;
  endIso: string;
  fechaIsoDia: string;
  diaTexto?: string;
  estadoCita?: string;
  // Flujo de recordatorio
  estadoRecordatorio: ReminderEstado;
  ultimoRecordatorioTipo?: ReminderTipo;
  dayBeforeSentAt?: string;
  threeHoursSentAt?: string;
  respondedAt?: string;
  responseText?: string;
  noResponseCheckedAt?: string;
  channel?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrmCase {
  id: string;
  patientId: string;
  entityId?: string;
  type: CrmCaseType;
  status: CrmStatus;
  nextAction?: string;
  responsible?: string;
  lastInteraction: string;
  observations?: string;
  createdAt: string;
}

export interface WhatsappConversation {
  id: string;
  patientId?: string;
  phone: string;
  contactName: string;
  lastMessage?: string;
  status: WaConversationStatus;
  intent?: WaIntent;
  updatedAt: string;
  messages: WhatsappMessage[];
}

export interface WhatsappMessage {
  id: string;
  direction: "IN" | "OUT";
  body: string;
  createdAt: string;
  attachmentLabel?: string;
}

export interface Payment {
  id: string;
  patientId: string;
  concept: string;
  amount: number;
  method: string;
  paidAt?: string;
  status: PaymentStatus;
  observation?: string;
}

export interface AttachedFile {
  id: string;
  patientId: string;
  fileType: string;
  fileName: string;
  uploadedAt: string;
}

export interface DocumentPack {
  id: string;
  entityId: string;
  label: string;
  format: "PDF" | "EXCEL";
}

export interface Consent {
  id: string;
  patientId: string;
  doctorId?: string;
  type: ConsentType;
  consultation?: string;
  entityName?: string;
  signedAt: string;
}
