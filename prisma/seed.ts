/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import {
  appointments,
  attachedFiles,
  consents,
  crmCases,
  doctors,
  documentPacks,
  entities,
  patients,
  payments,
  reminders,
  whatsappConversations,
} from "../src/lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando datos existentes...");
  // Orden inverso por dependencias
  await prisma.whatsappMessage.deleteMany();
  await prisma.whatsappConversation.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.attachedFile.deleteMany();
  await prisma.consent.deleteMany();
  await prisma.odontologiaEvolucion.deleteMany();
  await prisma.odontologiaValoracion.deleteMany();
  await prisma.odontologiaHistoriaClinica.deleteMany();
  await prisma.odontologiaHistorico.deleteMany();
  await prisma.odontologiaOdontograma.deleteMany();
  await prisma.ortodonciaEvolucion.deleteMany();
  await prisma.ortodonciaValoracion.deleteMany();
  await prisma.ortodonciaHistoriaClinica.deleteMany();
  await prisma.ortodonciaHistorico.deleteMany();
  await prisma.ortodonciaOdontograma.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.crmCase.deleteMany();
  await prisma.documentPack.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.entity.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cargando usuario administrador...");
  await prisma.user.create({
    data: { email: "admin@saludplena.demo", name: "Administrador", role: "ADMINISTRADOR" },
  });

  console.log("Cargando entidades...");
  for (const e of entities) {
    await prisma.entity.create({ data: { id: e.id, name: e.name, type: e.type, active: e.active } });
  }

  console.log("Cargando doctores...");
  for (const d of doctors) {
    await prisma.doctor.create({
      data: { id: d.id, firstName: d.firstName, lastName: d.lastName, specialty: d.specialty, email: d.email, phone: d.phone, active: d.active },
    });
  }

  console.log("Cargando pacientes...");
  for (const p of patients) {
    await prisma.patient.create({
      data: {
        id: p.id,
        documentNumber: p.documentNumber,
        documentType: p.documentType,
        expeditionPlace: p.expeditionPlace,
        firstName: p.firstName,
        middleName: p.middleName,
        firstLastName: p.firstLastName,
        secondLastName: p.secondLastName,
        gender: p.gender,
        birthDate: new Date(p.birthDate),
        patientType: p.patientType,
        entityId: p.entityId,
        phone: p.phone,
        cellphone: p.cellphone,
        email: p.email,
        address: p.address,
        neighborhood: p.neighborhood,
        city: p.city,
        state: p.state,
        status: p.status,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      },
    });
  }

  console.log("Cargando citas...");
  for (const a of appointments) {
    await prisma.appointment.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: {
        id: a.id,
        patientId: a.patientId,
        doctorId: a.doctorId,
        entityId: a.entityId,
        startIso: new Date(a.startIso),
        endIso: new Date(a.endIso),
        fechaIsoDia: new Date(a.fechaIsoDia),
        diaTexto: a.diaTexto,
        servicio: a.servicio,
        name: a.name,
        phone: a.phone,
        especialistaNombre: a.especialistaNombre,
        estadoCita: a.estadoCita ?? 'pendiente',
        date: new Date(a.startIso),
        durationMinutes: a.durationMinutes ?? 30,
        treatment: a.servicio ?? a.treatment ?? '',
        observation: a.observation,
        status: a.status,
        confirmationStatus: a.confirmationStatus,
      } as any,
    });
  }

  console.log("Cargando recordatorios...");
  for (const r of reminders) {
    await prisma.reminder.create({
      data: {
        id: r.id,
        appointmentId: r.appointmentId,
        patientId: r.patientId,
        doctorId: r.doctorId,
        entityId: r.entityId,
        phone: r.phone,
        name: r.name,
        servicio: r.servicio,
        especialistaNombre: r.especialistaNombre,
        fechaTextoOriginal: r.fechaTextoOriginal,
        startIso: new Date(r.startIso),
        endIso: new Date(r.endIso),
        fechaIsoDia: new Date(r.fechaIsoDia),
        diaTexto: r.diaTexto,
        estadoCita: r.estadoCita ?? "pendiente",
        estadoRecordatorio: r.estadoRecordatorio,
        ultimoRecordatorioTipo: r.ultimoRecordatorioTipo,
        dayBeforeSentAt: r.dayBeforeSentAt ? new Date(r.dayBeforeSentAt) : null,
        threeHoursSentAt: r.threeHoursSentAt ? new Date(r.threeHoursSentAt) : null,
        respondedAt: r.respondedAt ? new Date(r.respondedAt) : null,
        responseText: r.responseText,
        channel: r.channel ?? "WHATSAPP",
      },
    });
  }

  console.log("Cargando casos CRM...");
  for (const c of crmCases) {
    await prisma.crmCase.create({
      data: {
        id: c.id,
        patientId: c.patientId,
        entityId: c.entityId,
        type: c.type,
        status: c.status,
        nextAction: c.nextAction,
        responsible: c.responsible,
        lastInteraction: new Date(c.lastInteraction),
        observations: c.observations,
        createdAt: new Date(c.createdAt),
      },
    });
  }

  console.log("Cargando pagos...");
  for (const p of payments) {
    await prisma.payment.create({
      data: {
        id: p.id,
        patientId: p.patientId,
        concept: p.concept,
        amount: p.amount,
        method: p.method,
        paidAt: p.paidAt ? new Date(p.paidAt) : null,
        status: p.status,
        observation: p.observation,
      },
    });
  }

  console.log("Cargando archivos...");
  for (const f of attachedFiles) {
    await prisma.attachedFile.create({
      data: {
        id: f.id,
        patientId: f.patientId,
        fileType: f.fileType,
        fileName: f.fileName,
        uploadedAt: new Date(f.uploadedAt),
      },
    });
  }

  console.log("Cargando paquetes documentales...");
  for (const d of documentPacks) {
    await prisma.documentPack.create({
      data: { id: d.id, entityId: d.entityId, label: d.label, format: d.format },
    });
  }

  console.log("Cargando consentimientos...");
  for (const c of consents) {
    await prisma.consent.create({
      data: {
        id: c.id,
        patientId: c.patientId,
        doctorId: c.doctorId,
        type: c.type,
        consultation: c.consultation,
        entityName: c.entityName,
        signedAt: new Date(c.signedAt),
      },
    });
  }

  console.log("Cargando conversaciones WhatsApp...");
  for (const w of whatsappConversations) {
    const conv = await prisma.whatsappConversation.create({
      data: {
        id: w.id,
        patientId: w.patientId,
        phone: w.phone,
        contactName: w.contactName,
        lastMessage: w.lastMessage,
        status: w.status,
        intent: w.intent,
        updatedAt: new Date(w.updatedAt),
      },
    });
    for (const m of w.messages) {
      await prisma.whatsappMessage.create({
        data: {
          id: m.id,
          conversationId: conv.id,
          direction: m.direction,
          body: m.body,
          createdAt: new Date(m.createdAt),
          attachmentLabel: m.attachmentLabel,
        },
      });
    }
  }

  // ── Andrés Felipe Ramírez Torres — historial odontológico demo MedPlus ──
  console.log("Cargando historial odontológico Andrés Ramírez...");

  await prisma.odontologiaHistoriaClinica.create({
    data: {
      patientId: "pat-andres-medplus",
      payload: {
        motivoConsulta: "Revisión semestral y limpieza dental — autorización MedPlus",
        diagnostico: "K05.1 Periodontitis crónica leve · K02.1 Caries de dentina pieza 16",
        planTratamiento: "1. Detartraje supragingival · 2. Obturación pieza 16 · 3. Control en 6 meses · 4. Extracción pieza 28 si persiste sintomatología",
        antecedentes: {
          medicos: "Hipertensión arterial controlada (Losartán 50mg/día)",
          alergias: "Penicilina (reacción cutánea)",
          medicamentos: "Losartán 50mg una vez al día",
          previosTratamientos: "Exodoncias piezas 17 y 18 en 2019 (otra institución)",
        },
        examenClinico: {
          tejidosBlandos: "Encías con leve eritema marginal en sector posterior",
          oclusionDental: "Clase I de Angle, leve apretamiento parafuncional",
          higieneBucal: "Regular, índice de placa 40%, cálculo supragingival generalizado",
        },
      },
    },
  });

  const andresHistoricos = [
    { date: new Date("2024-06-10"), motive: "Examen diagnóstico inicial", doctorName: "Dra. Laura Castillo", observation: "Paciente nuevo referido por MedPlus. Radiografías panorámica y periapicales tomadas.", procedures: "Examen clínico completo, toma de radiografías, plan de tratamiento elaborado" },
    { date: new Date("2024-08-22"), motive: "Detartraje supragingival y pulido coronal", doctorName: "Dra. Laura Castillo", observation: "Procedimiento realizado sin complicaciones. Se indica cepillado con técnica modificada de Bass.", procedures: "Detartraje supragingival completo, pulido coronal con pasta profiláctica, instrucción de higiene oral" },
    { date: new Date("2024-10-15"), motive: "Obturación con composite pieza 16", doctorName: "Dra. Laura Castillo", observation: "Caries de dentina de extensión moderada. Restauración con composite fotopolimerizable color A2.", procedures: "Anestesia infiltrativa, preparación cavitaria, grabado ácido, bonding, composite fotopolimerizable, pulido y ajuste oclusal" },
    { date: new Date("2025-01-20"), motive: "Control periódico y fluorización", doctorName: "Dra. Laura Castillo", observation: "Excelente respuesta al tratamiento. Índice de placa mejorado a 15%. Encías sin sangrado.", procedures: "Examen de control, fluorización tópica con gel fluorado 1.23%, refuerzo de instrucción de higiene" },
    { date: new Date("2025-05-08"), motive: "Extracción simple pieza 28 (cordal inferior izquierdo)", doctorName: "Dr. Sebastian Pulido", observation: "Pieza semierupcionada con pericoronaritis recurrente. Indicación de extracción confirmada por radiografía.", procedures: "Anestesia troncular inferior, sindesmotomía, exodoncia simple, curetaje del alveolo, sutura simple 3-0, indicaciones postoperatorias" },
  ];

  for (const h of andresHistoricos) {
    await prisma.odontologiaHistorico.create({ data: { patientId: "pat-andres-medplus", ...h } });
  }

  const andresEvoluciones = [
    { date: new Date("2024-08-22"), treatment: "Detartraje supragingival", note: "Paciente toleró bien el procedimiento. Leve sangrado gingival durante la limpieza, dentro de lo esperado. Se indica enjuague con clorhexidina 0.12% por 7 días.", doctorName: "Dra. Laura Castillo", signedByDoc: true, signedByPat: true },
    { date: new Date("2024-10-15"), treatment: "Obturación composite pieza 16", note: "Restauración exitosa con excelente adaptación marginal y resultado estético. Paciente refiere leve sensibilidad postoperatoria esperada. Control en 1 semana si persiste.", doctorName: "Dra. Laura Castillo", signedByDoc: true, signedByPat: true },
    { date: new Date("2025-05-08"), treatment: "Extracción pieza 28", note: "Extracción realizada sin complicaciones intraoperatorias. Sangrado controlado. Se indica ibuprofeno 400mg cada 8 horas por 3 días, amoxicilina 500mg cada 8 horas por 7 días (confirmado ausencia de alergia a betalactámicos), retiro de sutura en 7 días.", doctorName: "Dr. Sebastian Pulido", signedByDoc: true, signedByPat: true },
  ];

  for (const ev of andresEvoluciones) {
    await prisma.odontologiaEvolucion.create({ data: { patientId: "pat-andres-medplus", ...ev } });
  }

  console.log("✓ Seed completado");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
