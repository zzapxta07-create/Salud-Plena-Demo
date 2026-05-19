import { PageHeader } from "@/components/ui/page-header";
import { EvolucionForm } from "@/components/clinic/evolucion-form";

export default function Page() {
  const existing = [
    {
      id: "evo-1",
      patientId: "pat-3",
      treatment: "Ajuste brackets — mes 4",
      note: "Cambio de arco rectangular 16x22 NiTi. Control de torque incisivos superiores. Buena higiene oral. Proximo control en 4 semanas.",
      doctorName: "Dr(a). Andres Marin",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    },
  ];
  return (
    <>
      <PageHeader
        title="Ortodoncia — Evolucion"
        subtitle="Notas de evolucion de tratamiento de ortodoncia, asociadas a paciente y doctor"
        breadcrumbs={[{ label: "Ortodoncia" }, { label: "Evolucion" }]}
      />
      <EvolucionForm specialty="Ortodoncia" existing={existing} />
    </>
  );
}
