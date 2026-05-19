import { PageHeader } from "@/components/ui/page-header";
import { HistoriaClinicaForm } from "@/components/clinic/historia-clinica-form";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Ortodoncia — Historia clinica"
        subtitle="Antecedentes, examenes y diagnosticos orientados a ortodoncia"
        breadcrumbs={[{ label: "Ortodoncia" }, { label: "Historia clinica" }]}
      />
      <HistoriaClinicaForm specialty="Ortodoncia" />
    </>
  );
}
