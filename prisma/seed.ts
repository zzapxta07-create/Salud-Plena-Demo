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
      data: {
        id: a.id,
        patientId: a.patientId,
        doctorId: a.doctorId,
        entityId: a.entityId,
        date: new Date(a.date),
        durationMinutes: a.durationMinutes,
        treatment: a.treatment,
        observation: a.observation,
        status: a.status,
        confirmationStatus: a.confirmationStatus,
      },
    });
  }

  console.log("Cargando recordatorios...");
  for (const r of reminders) {
    await prisma.reminder.create({
      data: {
        id: r.id,
        appointmentId: r.appointmentId,
        patientId: r.patientId,
        stage: r.stage,
        scheduledAt: new Date(r.scheduledAt),
        sentAt: r.sentAt ? new Date(r.sentAt) : null,
        status: r.status,
        patientReply: r.patientReply,
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
