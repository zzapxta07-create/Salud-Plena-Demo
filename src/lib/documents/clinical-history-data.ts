import { prisma } from "@/lib/db";

export type ClinicalHistoryData = NonNullable<Awaited<ReturnType<typeof fetchClinicalHistoryData>>>;

export async function fetchClinicalHistoryData(patientId: string) {
  return prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      entity: true,
      appointments: {
        include: { doctor: true },
        orderBy: { startIso: "asc" },
        take: 20,
      },
      odoHistoria: { orderBy: { createdAt: "desc" }, take: 1 },
      odoHistoricos: { orderBy: { date: "desc" } },
      odoEvoluciones: { orderBy: { date: "desc" } },
    },
  });
}
