import { PageHeader } from "@/components/ui/page-header";
import { HistoriaClinicaForm } from "@/components/clinic/historia-clinica-form";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Odontologia — Historia clinica"
        subtitle="Registro completo de antecedentes, examenes y diagnosticos"
        breadcrumbs={[{ label: "Odontologia" }, { label: "Historia clinica" }]}
      />
      <HistoriaClinicaForm specialty="Odontologia" />
    </>
  );
}
