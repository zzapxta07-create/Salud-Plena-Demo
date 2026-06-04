import type {
  Appointment,
  AttachedFile,
  Consent,
  CrmCase,
  Doctor,
  DocumentPack,
  Entity,
  Patient,
  Payment,
  Reminder,
  WhatsappConversation,
} from "./types";

const nowISO = () => new Date().toISOString();
const addDays = (days: number, base = new Date()) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};
const addHours = (hours: number, base = new Date()) => {
  const d = new Date(base);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
};

export const entities: Entity[] = [
  { id: "ent-1", name: "Particular", type: "Particular", active: true },
  { id: "ent-2", name: "MedPlus", type: "Aseguradora", active: true },
  { id: "ent-3", name: "Sura", type: "Aseguradora", active: true },
  { id: "ent-4", name: "Salud Total", type: "Aseguradora", active: true },
  { id: "ent-5", name: "ARL Bolivar", type: "ARL", active: true },
];

export const doctors: Doctor[] = [
  { id: "doc-1", firstName: "Laura", lastName: "Castillo", specialty: "Odontologia general", email: "laura.c@saludplena.demo", phone: "300 555 1001", active: true },
  { id: "doc-2", firstName: "Andres", lastName: "Marin", specialty: "Ortodoncia", email: "andres.m@saludplena.demo", phone: "300 555 1002", active: true },
  { id: "doc-3", firstName: "Carolina", lastName: "Rios", specialty: "Endodoncia", email: "caro.r@saludplena.demo", phone: "300 555 1003", active: true },
  { id: "doc-4", firstName: "Sebastian", lastName: "Pulido", specialty: "Periodoncia / Implantes", email: "seb.p@saludplena.demo", phone: "300 555 1004", active: true },
];

export const patients: Patient[] = [
  {
    id: "pat-1",
    documentNumber: "1010101010",
    documentType: "CC",
    expeditionPlace: "Bogota D.C.",
    firstName: "Valeria",
    middleName: "",
    firstLastName: "Rodriguez",
    secondLastName: "Beltran",
    gender: "Femenino",
    birthDate: "1992-04-12",
    patientType: "ASEGURADORA",
    entityId: "ent-2",
    entityName: "MedPlus",
    phone: "601 555 4400",
    cellphone: "311 444 7788",
    email: "valeria.r@correo.demo",
    address: "Cra 11 #84-30 Apto 502",
    neighborhood: "El Nogal",
    city: "Bogota",
    state: "Cundinamarca",
    status: "EN_TRATAMIENTO",
    createdAt: addDays(-120),
    updatedAt: addDays(-3),
  },
  {
    id: "pat-2",
    documentNumber: "1020203030",
    documentType: "CC",
    expeditionPlace: "Medellin",
    firstName: "Mateo",
    firstLastName: "Gomez",
    secondLastName: "Henao",
    gender: "Masculino",
    birthDate: "1988-09-22",
    patientType: "PARTICULAR",
    entityId: "ent-1",
    entityName: "Particular",
    cellphone: "320 318 9090",
    email: "mateo.g@correo.demo",
    address: "Cl 10 #43A-22",
    neighborhood: "Poblado",
    city: "Medellin",
    state: "Antioquia",
    status: "AGENDADO",
    createdAt: addDays(-80),
    updatedAt: addDays(-1),
  },
  {
    id: "pat-3",
    documentNumber: "1030304040",
    documentType: "CC",
    expeditionPlace: "Cali",
    firstName: "Isabella",
    middleName: "Sofia",
    firstLastName: "Quintero",
    secondLastName: "Mosquera",
    gender: "Femenino",
    birthDate: "2002-01-30",
    patientType: "ASEGURADORA",
    entityId: "ent-3",
    entityName: "Sura",
    cellphone: "315 222 1100",
    email: "isabella.q@correo.demo",
    address: "Av 6N #25-10",
    neighborhood: "Granada",
    city: "Cali",
    state: "Valle del Cauca",
    status: "EN_AUTORIZACION",
    createdAt: addDays(-30),
    updatedAt: addDays(-2),
  },
  {
    id: "pat-4",
    documentNumber: "1040405050",
    documentType: "CC",
    expeditionPlace: "Barranquilla",
    firstName: "Carlos",
    firstLastName: "Pacheco",
    secondLastName: "Olivares",
    gender: "Masculino",
    birthDate: "1975-06-04",
    patientType: "ARL",
    entityId: "ent-5",
    entityName: "ARL Bolivar",
    cellphone: "300 989 4567",
    email: "carlos.p@correo.demo",
    address: "Cl 84 #50-21",
    neighborhood: "Riomar",
    city: "Barranquilla",
    state: "Atlantico",
    status: "PENDIENTE_DOCUMENTOS",
    createdAt: addDays(-12),
    updatedAt: addDays(-1),
  },
  {
    id: "pat-5",
    documentNumber: "1050506060",
    documentType: "TI",
    expeditionPlace: "Bogota D.C.",
    firstName: "Juliana",
    firstLastName: "Forero",
    secondLastName: "Vargas",
    gender: "Femenino",
    birthDate: "2011-11-15",
    patientType: "ASEGURADORA",
    entityId: "ent-4",
    entityName: "Salud Total",
    cellphone: "310 781 0011",
    email: "j.forero.acudiente@correo.demo",
    address: "Cl 145 #19-40",
    neighborhood: "Cedritos",
    city: "Bogota",
    state: "Cundinamarca",
    status: "NUEVO",
    createdAt: addDays(-2),
    updatedAt: addDays(-2),
  },
  {
    // DEMO — reemplazar por datos ficticios en producción
    id: "pat-6",
    documentNumber: "1109548694",
    documentType: "CC",
    expeditionPlace: "Bogota D.C.",
    firstName: "Angel",
    firstLastName: "Zapata",
    gender: "Masculino",
    birthDate: "2007-11-28",
    patientType: "PARTICULAR",
    entityId: "ent-1",
    entityName: "Particular",
    cellphone: "3053427529",
    phone: "3053427529",
    status: "NUEVO",
    createdAt: addDays(-1),
    updatedAt: addDays(-1),
  },
  {
    id: "pat-andres-medplus",
    documentNumber: "1098765432",
    documentType: "CC",
    expeditionPlace: "Bogota D.C.",
    firstName: "Andres",
    middleName: "Felipe",
    firstLastName: "Ramirez",
    secondLastName: "Torres",
    gender: "Masculino",
    birthDate: "1985-03-15",
    patientType: "ASEGURADORA",
    entityId: "ent-2",
    entityName: "MedPlus",
    cellphone: "3001234567",
    email: "andres.ramirez@correo.co",
    address: "Cra 15 # 82-34 Apto 501",
    neighborhood: "Chapinero",
    city: "Bogota",
    state: "Cundinamarca",
    status: "EN_TRATAMIENTO",
    createdAt: addDays(-180),
    updatedAt: addDays(-5),
  },
];

const today = new Date();
today.setHours(0, 0, 0, 0);

const addHoursToDay = (day: string | Date, hours: number) => {
  const d = typeof day === "string" ? new Date(day) : new Date(day);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
};

const setTime = (day: string | Date, hour: number, minute: number) => {
  const d = typeof day === "string" ? new Date(day) : new Date(day);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const ES_DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function mkAppt(base: {
  id: string;
  patientId: string;
  doctorId: string;
  entityId?: string;
  date: string;
  durationMinutes: number;
  treatment: string;
  observation?: string;
  status: Appointment["status"];
  confirmationStatus: Appointment["confirmationStatus"];
}): Appointment {
  const start = new Date(base.date);
  const end = new Date(start.getTime() + base.durationMinutes * 60000);
  const pat = patients.find((p) => p.id === base.patientId);
  const doc = doctors.find((d) => d.id === base.doctorId);
  return {
    ...base,
    startIso: base.date,
    endIso: end.toISOString(),
    fechaIsoDia: start.toISOString().split("T")[0],
    diaTexto: ES_DAYS[start.getDay()],
    servicio: base.treatment,
    name: pat ? `${pat.firstName} ${pat.firstLastName}` : undefined,
    phone: pat?.cellphone ?? pat?.phone,
    especialistaNombre: doc ? `Dr(a). ${doc.firstName} ${doc.lastName}` : undefined,
    estadoCita: base.status.toLowerCase(),
    fechaTextoOriginal: `${ES_DAYS[start.getDay()]} ${start.getDate()}/${start.getMonth() + 1} ${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
  };
}

export const appointments: Appointment[] = [
  // Hoy
  mkAppt({ id: "apt-1",  patientId: "pat-1", doctorId: "doc-1", entityId: "ent-2", date: addHoursToDay(today, 9),  durationMinutes: 30, treatment: "Limpieza dental",          observation: "Paciente en tratamiento periodontal", status: "AGENDADA",   confirmationStatus: "CONFIRMADA" }),
  mkAppt({ id: "apt-2",  patientId: "pat-2", doctorId: "doc-1",                    date: addHoursToDay(today, 10), durationMinutes: 45, treatment: "Obturacion resina",                                                                     status: "AGENDADA",   confirmationStatus: "PENDIENTE"  }),
  mkAppt({ id: "apt-3",  patientId: "pat-3", doctorId: "doc-2", entityId: "ent-3", date: addHoursToDay(today, 11), durationMinutes: 60, treatment: "Control ortodoncia",                                                                    status: "PENDIENTE",  confirmationStatus: "PENDIENTE"  }),
  mkAppt({ id: "apt-11", patientId: "pat-4", doctorId: "doc-3", entityId: "ent-5", date: addHoursToDay(today, 14), durationMinutes: 45, treatment: "Evaluacion endodoncia",                                                                 status: "AGENDADA",   confirmationStatus: "CONFIRMADA" }),
  mkAppt({ id: "apt-12", patientId: "pat-5", doctorId: "doc-4", entityId: "ent-4", date: addHoursToDay(today, 15), durationMinutes: 60, treatment: "Periodoncia - sesion 1",                                                                status: "AGENDADA",   confirmationStatus: "PENDIENTE"  }),

  // Mañana
  mkAppt({ id: "apt-4",  patientId: "pat-4", doctorId: "doc-3", entityId: "ent-5", date: addHoursToDay(addDays(1), 9),  durationMinutes: 60, treatment: "Endodoncia molar 26",                                                             status: "AGENDADA",   confirmationStatus: "PENDIENTE"  }),
  mkAppt({ id: "apt-13", patientId: "pat-1", doctorId: "doc-1", entityId: "ent-2", date: addHoursToDay(addDays(1), 10), durationMinutes: 30, treatment: "Limpieza dental",                                                                  status: "AGENDADA",   confirmationStatus: "CONFIRMADA" }),
  mkAppt({ id: "apt-14", patientId: "pat-2", doctorId: "doc-2",                    date: addHoursToDay(addDays(1), 13), durationMinutes: 45, treatment: "Valoracion ortodoncia",                                                            status: "AGENDADA",   confirmationStatus: "PENDIENTE"  }),

  // Pasado mañana
  mkAppt({ id: "apt-5",  patientId: "pat-5", doctorId: "doc-1", entityId: "ent-4", date: addHoursToDay(addDays(2), 8),  durationMinutes: 30, treatment: "Valoracion inicial",                                                              status: "AGENDADA",   confirmationStatus: "PENDIENTE"  }),
  mkAppt({ id: "apt-15", patientId: "pat-3", doctorId: "doc-4", entityId: "ent-3", date: addHoursToDay(addDays(2), 11), durationMinutes: 90, treatment: "Periodoncia - procedimiento",                                                      status: "AGENDADA",   confirmationStatus: "CONFIRMADA" }),

  // En 3 días
  mkAppt({ id: "apt-6",  patientId: "pat-1", doctorId: "doc-4", entityId: "ent-2", date: addHoursToDay(addDays(3), 9),  durationMinutes: 45, treatment: "Periodoncia - seguimiento",                                                       status: "AGENDADA",   confirmationStatus: "PENDIENTE"  }),
  mkAppt({ id: "apt-16", patientId: "pat-4", doctorId: "doc-1", entityId: "ent-5", date: addHoursToDay(addDays(3), 14), durationMinutes: 30, treatment: "Control post-endodoncia",                                                          status: "AGENDADA",   confirmationStatus: "PENDIENTE"  }),

  // En 5 días
  mkAppt({ id: "apt-7",  patientId: "pat-3", doctorId: "doc-2", entityId: "ent-3", date: addHoursToDay(addDays(5), 10), durationMinutes: 30, treatment: "Ajuste brackets",                                                                  status: "AGENDADA",   confirmationStatus: "PENDIENTE"  }),
  mkAppt({ id: "apt-17", patientId: "pat-2", doctorId: "doc-3",                    date: addHoursToDay(addDays(5), 15), durationMinutes: 60, treatment: "Endodoncia 15",                                                                    status: "AGENDADA",   confirmationStatus: "CONFIRMADA" }),

  // Citas tempranas (< 08:00) — verifican que el calendario no superpone al header
  mkAppt({ id: "apt-19", patientId: "pat-5", doctorId: "doc-1", entityId: "ent-4", date: setTime(today, 6, 47),       durationMinutes: 30, treatment: "Urgencia dental temprana",                                                           status: "AGENDADA",   confirmationStatus: "CONFIRMADA" }),
  mkAppt({ id: "apt-20", patientId: "pat-2", doctorId: "doc-2",                    date: setTime(addDays(1), 7, 15),   durationMinutes: 45, treatment: "Control temprano ortodoncia",                                                        status: "AGENDADA",   confirmationStatus: "PENDIENTE"  }),

  // Angel Zapata — cita demo 2026-06-03 16:00
  mkAppt({ id: "apt-angel", patientId: "pat-6", doctorId: "doc-1", entityId: "ent-1", date: setTime("2026-06-03", 16, 0), durationMinutes: 60, treatment: "Valoración inicial", status: "AGENDADA", confirmationStatus: "PENDIENTE" }),

  // Pasadas
  mkAppt({ id: "apt-8",  patientId: "pat-2", doctorId: "doc-3",                    date: addHoursToDay(addDays(-2), 10),  durationMinutes: 60, treatment: "Endodoncia 14",           status: "FINALIZADA", confirmationStatus: "CONFIRMADA" }),
  mkAppt({ id: "apt-9",  patientId: "pat-4", doctorId: "doc-1", entityId: "ent-5", date: addHoursToDay(addDays(-7), 9),   durationMinutes: 30, treatment: "Valoracion inicial ARL",  status: "NO_ASISTIO", confirmationStatus: "NO_RESPONDE" }),
  mkAppt({ id: "apt-10", patientId: "pat-1", doctorId: "doc-1", entityId: "ent-2", date: addHoursToDay(addDays(-15), 14), durationMinutes: 30, treatment: "Limpieza dental",          status: "FINALIZADA", confirmationStatus: "CONFIRMADA" }),
  mkAppt({ id: "apt-18", patientId: "pat-3", doctorId: "doc-2", entityId: "ent-3", date: addHoursToDay(addDays(-5), 11),  durationMinutes: 60, treatment: "Control ortodoncia",       status: "FINALIZADA", confirmationStatus: "CONFIRMADA" }),
];

// Helper: crea un reminder espejo desde un appointment
function mkReminder(
  apt: Appointment,
  overrides: Partial<Reminder> = {}
): Reminder {
  return {
    id: `rem-${apt.id}`,
    appointmentId: apt.id,
    patientId: apt.patientId,
    doctorId: apt.doctorId,
    entityId: apt.entityId,
    phone: apt.phone,
    name: apt.name,
    servicio: apt.servicio,
    especialistaNombre: apt.especialistaNombre,
    fechaTextoOriginal: apt.fechaTextoOriginal,
    startIso: apt.startIso,
    endIso: apt.endIso,
    fechaIsoDia: apt.fechaIsoDia,
    diaTexto: apt.diaTexto,
    estadoCita: apt.estadoCita ?? "pendiente",
    estadoRecordatorio: "PENDIENTE",
    channel: "WHATSAPP",
    ...overrides,
  };
}

// Lookup rápido de appointment por id
const getApt = (id: string) => appointments.find((a) => a.id === id)!;

export const reminders: Reminder[] = [
  // apt-1 — Valeria hoy 09:00 — CONFIRMADO (recordatorio DIA_ANTES enviado y respondido)
  mkReminder(getApt("apt-1"), {
    id: "rem-apt-1",
    estadoRecordatorio: "CONFIRMADO",
    ultimoRecordatorioTipo: "DIA_ANTES",
    dayBeforeSentAt: addDays(-1),
    respondedAt: addHours(-1, today),
    responseText: "Confirmo, ahí estaré.",
    estadoCita: "confirmada",
  }),
  // apt-2 — Mateo hoy 10:00 — ENVIADO (DIA_ANTES enviado, sin respuesta aún)
  mkReminder(getApt("apt-2"), {
    id: "rem-apt-2",
    estadoRecordatorio: "ENVIADO",
    ultimoRecordatorioTipo: "DIA_ANTES",
    dayBeforeSentAt: addDays(-1),
  }),
  // apt-3 — Isabella hoy 11:00 — CANCELADO
  mkReminder(getApt("apt-3"), {
    id: "rem-apt-3",
    estadoRecordatorio: "CANCELADO",
    ultimoRecordatorioTipo: "DIA_ANTES",
    dayBeforeSentAt: addDays(-1),
    respondedAt: addHours(-2, today),
    responseText: "No puedo asistir, por favor cancelar.",
    estadoCita: "cancelada",
  }),
  // apt-4 — Carlos mañana 09:00 — PENDIENTE (cita de mañana, aún no se envía)
  mkReminder(getApt("apt-4"), {
    id: "rem-apt-4",
    estadoRecordatorio: "PENDIENTE",
  }),
  // apt-5 — Juliana pasado mañana 08:00 — PENDIENTE
  mkReminder(getApt("apt-5"), {
    id: "rem-apt-5",
    estadoRecordatorio: "PENDIENTE",
  }),
  // apt-6 — Valeria en 3 días — PENDIENTE
  mkReminder(getApt("apt-6"), {
    id: "rem-apt-6",
    estadoRecordatorio: "PENDIENTE",
  }),
  // apt-9 — Carlos hace 7 días — NO_RESPONDE
  mkReminder(getApt("apt-9"), {
    id: "rem-apt-9",
    estadoRecordatorio: "NO_RESPONDE",
    ultimoRecordatorioTipo: "TRES_HORAS",
    dayBeforeSentAt: addDays(-8),
    threeHoursSentAt: addDays(-7),
    noResponseCheckedAt: addDays(-7),
    estadoCita: "no_responde",
  }),
  // apt-11 — Carlos hoy 14:00 — REAGENDAR
  mkReminder(getApt("apt-11"), {
    id: "rem-apt-11",
    estadoRecordatorio: "REAGENDAR",
    ultimoRecordatorioTipo: "DIA_ANTES",
    dayBeforeSentAt: addDays(-1),
    respondedAt: addHours(-3, today),
    responseText: "No puedo ir hoy, ¿podemos reagendar para el viernes?",
    estadoCita: "reagendar",
  }),
  // apt-angel — Angel Zapata mañana 15:00 — PENDIENTE
  mkReminder(getApt("apt-angel"), {
    id: "rem-apt-angel",
    estadoRecordatorio: "PENDIENTE",
  }),
];

export const crmCases: CrmCase[] = [
  { id: "crm-1", patientId: "pat-3", entityId: "ent-3", type: "SOLICITUD_AUTORIZACION", status: "DOCUMENTOS_PENDIENTES", nextAction: "Solicitar formato de autorizacion firmado", responsible: "Administrador", lastInteraction: addDays(-1), observations: "Falta historia clinica firmada y soporte de afiliacion", createdAt: addDays(-3) },
  { id: "crm-2", patientId: "pat-4", entityId: "ent-5", type: "DOCUMENTO_PENDIENTE", status: "PENDIENTE_REVISION_HUMANA", nextAction: "Validar orden medica recibida", responsible: "Administrador", lastInteraction: addDays(0), observations: "Cliente envio orden por WhatsApp, requiere validacion", createdAt: addDays(-1) },
  { id: "crm-3", patientId: "pat-1", entityId: "ent-2", type: "SOLICITUD_AUTORIZACION", status: "RADICADO_SOLICITADO", nextAction: "Esperar radicado MedPlus", responsible: "Administrador", lastInteraction: addDays(-2), observations: "Solicitud radicada vía portal MedPlus", createdAt: addDays(-5) },
  { id: "crm-4", patientId: "pat-2", type: "PARTICULAR_INTERESADO", status: "LISTO_PARA_AGENDAR", nextAction: "Agendar cita para tratamiento integral", responsible: "Administrador", lastInteraction: addDays(0), observations: "Acepto cotizacion enviada", createdAt: addDays(-2) },
  { id: "crm-5", patientId: "pat-5", entityId: "ent-4", type: "SOLICITUD_AUTORIZACION", status: "NUEVO", nextAction: "Solicitar documentos basicos", responsible: "Administrador", lastInteraction: addDays(0), observations: "Acudiente solicito agendamiento por WhatsApp", createdAt: addDays(0) },
  { id: "crm-6", patientId: "pat-3", entityId: "ent-3", type: "COTIZACION_PENDIENTE", status: "EN_PREPARACION_DOCUMENTAL", nextAction: "Preparar paquete documental Sura", responsible: "Administrador", lastInteraction: addDays(-1), observations: "Caso paralelo de cotizacion ortodoncia", createdAt: addDays(-2) },
  { id: "crm-7", patientId: "pat-1", entityId: "ent-2", type: "LISTO_PARA_AGENDAR", status: "AGENDADO", nextAction: "Esperar asistencia paciente", responsible: "Administrador", lastInteraction: addDays(-1), observations: "Cita programada y confirmada", createdAt: addDays(-7) },
  { id: "crm-8", patientId: "pat-4", entityId: "ent-5", type: "REAGENDAMIENTO", status: "PERDIDO", nextAction: "Cerrar caso, paciente no respondio", responsible: "Administrador", lastInteraction: addDays(-7), observations: "No respondio despues de 3 recordatorios", createdAt: addDays(-10) },
];

export const whatsappConversations: WhatsappConversation[] = [
  {
    id: "wa-1",
    patientId: "pat-3",
    phone: "+57 315 222 1100",
    contactName: "Isabella Quintero",
    lastMessage: "Adjunto la orden medica solicitada.",
    status: "PENDIENTE_VALIDACION",
    intent: "SOLICITAR_AUTORIZACION",
    updatedAt: addHours(-1),
    messages: [
      { id: "m-1", direction: "IN", body: "Hola, necesito ayuda con una autorizacion de ortodoncia.", createdAt: addHours(-3) },
      { id: "m-2", direction: "OUT", body: "Hola Isabella, claro que si. Te ayudo a iniciar tu solicitud con Sura.", createdAt: addHours(-3) },
      { id: "m-3", direction: "OUT", body: "Necesito tu documento de identidad y orden medica. Puedes enviarlas por aqui?", createdAt: addHours(-2) },
      { id: "m-4", direction: "IN", body: "Adjunto la orden medica solicitada.", createdAt: addHours(-1), attachmentLabel: "orden-medica.pdf" },
    ],
  },
  {
    id: "wa-2",
    patientId: "pat-4",
    phone: "+57 300 989 4567",
    contactName: "Carlos Pacheco",
    lastMessage: "Listo, confirmo mi cita.",
    status: "GESTION_HUMANA",
    intent: "CONFIRMAR_CITA",
    updatedAt: addHours(-2),
    messages: [
      { id: "m-5", direction: "OUT", body: "Buen dia Carlos, le recordamos su cita manana 9:00 AM con la Dra. Carolina Rios.", createdAt: addHours(-4) },
      { id: "m-6", direction: "IN", body: "Listo, confirmo mi cita.", createdAt: addHours(-2) },
    ],
  },
  {
    id: "wa-3",
    phone: "+57 312 412 1188",
    contactName: "Nuevo contacto",
    lastMessage: "Quisiera saber el valor de una limpieza dental particular.",
    status: "NUEVA",
    intent: "SOLICITAR_COTIZACION",
    updatedAt: addHours(-5),
    messages: [
      { id: "m-7", direction: "IN", body: "Buenas tardes, quisiera saber el valor de una limpieza dental particular.", createdAt: addHours(-5) },
    ],
  },
  {
    id: "wa-4",
    patientId: "pat-2",
    phone: "+57 320 318 9090",
    contactName: "Mateo Gomez",
    lastMessage: "Puedo reagendar para el viernes en la tarde?",
    status: "REQUIERE_HUMANO",
    intent: "REAGENDAR_CITA",
    updatedAt: addHours(-8),
    messages: [
      { id: "m-8", direction: "IN", body: "No voy a poder asistir a mi cita del miercoles.", createdAt: addHours(-9) },
      { id: "m-9", direction: "IN", body: "Puedo reagendar para el viernes en la tarde?", createdAt: addHours(-8) },
    ],
  },
  {
    id: "wa-5",
    patientId: "pat-1",
    phone: "+57 311 444 7788",
    contactName: "Valeria Rodriguez",
    lastMessage: "Confirmo!",
    status: "FINALIZADA",
    intent: "CONFIRMAR_CITA",
    updatedAt: addHours(-12),
    messages: [
      { id: "m-10", direction: "OUT", body: "Hola Valeria, te confirmamos cita hoy 11:00 AM.", createdAt: addHours(-13) },
      { id: "m-11", direction: "IN", body: "Confirmo!", createdAt: addHours(-12) },
    ],
  },
];

export const payments: Payment[] = [
  { id: "pay-1", patientId: "pat-1", concept: "Periodoncia - sesion 2", amount: 280000, method: "Tarjeta credito", paidAt: addDays(-3), status: "PAGADO" },
  { id: "pay-2", patientId: "pat-2", concept: "Endodoncia 14", amount: 650000, method: "Transferencia", paidAt: addDays(-2), status: "PAGADO" },
  { id: "pay-3", patientId: "pat-3", concept: "Cuota ortodoncia mes 4", amount: 220000, method: "Efectivo", paidAt: addDays(-1), status: "ABONO", observation: "Saldo pendiente $200.000" },
  { id: "pay-4", patientId: "pat-5", concept: "Valoracion inicial", amount: 0, method: "Convenio", status: "PENDIENTE", observation: "Pendiente confirmacion autorizacion" },
  { id: "pay-5", patientId: "pat-1", concept: "Limpieza dental", amount: 120000, method: "Tarjeta debito", paidAt: addDays(-15), status: "PAGADO" },
];

export const attachedFiles: AttachedFile[] = [
  { id: "fil-1", patientId: "pat-3", fileType: "Orden medica", fileName: "orden-ortodoncia-isabella.pdf", uploadedAt: addHours(-1) },
  { id: "fil-2", patientId: "pat-3", fileType: "Documento de identidad", fileName: "cc-isabella.pdf", uploadedAt: addDays(-2) },
  { id: "fil-3", patientId: "pat-4", fileType: "Autorizacion de aseguradora", fileName: "autorizacion-arl-bolivar.pdf", uploadedAt: addDays(-1) },
  { id: "fil-4", patientId: "pat-1", fileType: "Consentimiento firmado", fileName: "consentimiento-periodoncia.pdf", uploadedAt: addDays(-5) },
  { id: "fil-5", patientId: "pat-1", fileType: "Historia clinica", fileName: "hc-valeria-2026.pdf", uploadedAt: addDays(-10) },
  { id: "fil-6", patientId: "pat-2", fileType: "Soporte de pago", fileName: "soporte-endodoncia.pdf", uploadedAt: addDays(-2) },
  { id: "fil-7", patientId: "pat-5", fileType: "Documento de identidad", fileName: "ti-juliana.pdf", uploadedAt: addDays(-2) },
  { id: "fil-8", patientId: "pat-3", fileType: "Soporte de pago", fileName: "comprobante-marzo.pdf", uploadedAt: addDays(-1) },
];

export const documentPacks: DocumentPack[] = [
  { id: "pkg-1", entityId: "ent-2", label: "Historia clinica", format: "PDF" },
  { id: "pkg-2", entityId: "ent-2", label: "Historico de citas", format: "PDF" },
  { id: "pkg-3", entityId: "ent-2", label: "Formato de autorizacion especial", format: "EXCEL" },
  { id: "pkg-4", entityId: "ent-3", label: "Historia clinica", format: "PDF" },
  { id: "pkg-5", entityId: "ent-3", label: "Historico de citas", format: "PDF" },
  { id: "pkg-6", entityId: "ent-3", label: "Soporte de autorizacion", format: "PDF" },
];

export const consents: Consent[] = [
  { id: "cons-1", patientId: "pat-1", doctorId: "doc-4", type: "PERIODONCIA", consultation: "Periodoncia - sesion 1", entityName: "MedPlus", signedAt: addDays(-30) },
  { id: "cons-2", patientId: "pat-2", doctorId: "doc-3", type: "ENDODONCIA", consultation: "Endodoncia diente 14", entityName: "Particular", signedAt: addDays(-3) },
  { id: "cons-3", patientId: "pat-3", doctorId: "doc-2", type: "PROCEDIMIENTOS_IMPLANTOLOGICOS", consultation: "Valoracion implantologica", entityName: "Sura", signedAt: addDays(-20) },
];

export type DashboardMetrics = {
  registeredPatients: number;
  appointmentsToday: number;
  unconfirmedAppointments: number;
  pendingReminders: number;
  activeCrmCases: number;
  crmCasesWithPendingDocs: number;
  crmReadyToSchedule: number;
  patientsNotResponding: number;
};

export function getDashboardMetrics(): DashboardMetrics {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  return {
    registeredPatients: patients.length,
    appointmentsToday: appointments.filter((a) => {
      const d = new Date(a.startIso);
      return d >= todayStart && d < todayEnd;
    }).length,
    unconfirmedAppointments: appointments.filter(
      (a) => a.confirmationStatus === "PENDIENTE" && new Date(a.startIso) >= todayStart,
    ).length,
    pendingReminders: reminders.filter((r) => r.estadoRecordatorio === "PENDIENTE").length,
    activeCrmCases: crmCases.filter((c) => !["FINALIZADO", "PERDIDO"].includes(c.status)).length,
    crmCasesWithPendingDocs: crmCases.filter((c) => c.status === "DOCUMENTOS_PENDIENTES").length,
    crmReadyToSchedule: crmCases.filter((c) => c.status === "LISTO_PARA_AGENDAR").length,
    patientsNotResponding: reminders.filter((r) => r.estadoRecordatorio === "NO_RESPONDE").length,
  };
}

export function findPatient(id: string): Patient | undefined {
  return patients.find((p) => p.id === id);
}

export function findPatientByDoc(doc: string): Patient | undefined {
  return patients.find((p) => p.documentNumber === doc);
}

export function doctorName(id: string | undefined): string {
  if (!id) return "—";
  const d = doctors.find((x) => x.id === id);
  return d ? `Dr(a). ${d.firstName} ${d.lastName}` : "—";
}

export function entityName(id: string | undefined): string {
  if (!id) return "—";
  return entities.find((e) => e.id === id)?.name ?? "—";
}
